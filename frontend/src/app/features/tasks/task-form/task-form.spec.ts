import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, of, throwError } from 'rxjs';
import { TaskApiService } from '../../../core/api/task-api.service';
import { MessageService } from '../../../core/messages/message.service';
import { Task, TaskInput } from '../../../core/models/task';
import { TaskForm } from './task-form';

@Component({ template: '<p>Lista</p>' })
class ListStub {}

const task: Task = {
  id: 3,
  title: 'Regar las plantas',
  completed: false,
  createdAt: '2026-11-26T10:00:00+00:00',
  recurrence: 'monthly',
  nextOccurrenceDate: '2026-12-26',
  templateId: null,
  deletedAt: null,
};

interface TaskApiStub {
  get: ReturnType<typeof vi.fn<(id: number) => Observable<Task>>>;
  create: ReturnType<typeof vi.fn<(input: TaskInput) => Observable<Task>>>;
  update: ReturnType<typeof vi.fn<(id: number, input: TaskInput) => Observable<Task>>>;
}

describe('TaskForm', () => {
  let api: TaskApiStub;
  let harness: RouterTestingHarness;

  function element(): HTMLElement {
    return harness.routeNativeElement as HTMLElement;
  }

  function titleInput(): HTMLInputElement {
    return element().querySelector<HTMLInputElement>('#title')!;
  }

  function recurringCheck(): HTMLInputElement {
    return element().querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  }

  function recurrenceSelect(): HTMLSelectElement | null {
    return element().querySelector<HTMLSelectElement>('#recurrence');
  }

  async function type(input: HTMLInputElement, value: string): Promise<void> {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();
  }

  async function toggleRecurring(): Promise<void> {
    recurringCheck().click();
    await harness.fixture.whenStable();
  }

  async function submit(): Promise<void> {
    element().querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await harness.fixture.whenStable();
  }

  beforeEach(async () => {
    api = { get: vi.fn(), create: vi.fn(), update: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'tasks', component: ListStub },
          { path: 'tasks/new', component: TaskForm },
          { path: 'tasks/:id/edit', component: TaskForm },
        ]),
        { provide: TaskApiService, useValue: api },
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  describe('create mode', () => {
    beforeEach(async () => {
      await harness.navigateByUrl('/tasks/new');
    });

    it('should show the create title', () => {
      expect(element().querySelector('h2')?.textContent).toContain('Nueva tarea');
    });

    it('should not send the form when the title is empty', async () => {
      await submit();

      expect(api.create).not.toHaveBeenCalled();
      expect(element().querySelector('#title-error')?.textContent).toContain('Error: El título es obligatorio.');
      expect(titleInput().getAttribute('aria-invalid')).toBe('true');
      expect(document.activeElement).toBe(titleInput());
    });

    it('should not send the form when the title only has spaces', async () => {
      await type(titleInput(), '   ');
      await submit();

      expect(api.create).not.toHaveBeenCalled();
      expect(element().querySelector('#title-error')).not.toBeNull();
    });

    it('should not send a recurring task without recurrence', async () => {
      await type(titleInput(), 'Regar las plantas');
      await toggleRecurring();
      const select = recurrenceSelect()!;
      select.value = '';
      select.dispatchEvent(new Event('change'));
      await harness.fixture.whenStable();

      await submit();

      expect(api.create).not.toHaveBeenCalled();
    });

    it('should show the recurrence selector with weekly preselected when recurring is checked', async () => {
      expect(recurrenceSelect()).toBeNull();

      await toggleRecurring();

      expect(recurrenceSelect()?.value).toBe('weekly');
    });

    it('should create a task without recurrence and go back to the list', async () => {
      api.create.mockReturnValue(of({ ...task, recurrence: null }));
      await type(titleInput(), '  Comprar pan  ');

      await submit();

      expect(api.create).toHaveBeenCalledWith({ title: 'Comprar pan', recurrence: null });
      expect(TestBed.inject(Router).url).toBe('/tasks');
      expect(TestBed.inject(MessageService).status()).toBe('Tarea creada.');
    });

    it('should create a recurring task with the chosen recurrence', async () => {
      api.create.mockReturnValue(of(task));
      await type(titleInput(), 'Regar las plantas');
      await toggleRecurring();
      const select = recurrenceSelect()!;
      select.value = 'daily';
      select.dispatchEvent(new Event('change'));

      await submit();

      expect(api.create).toHaveBeenCalledWith({ title: 'Regar las plantas', recurrence: 'daily' });
    });

    it('should send no recurrence when recurring is unchecked again', async () => {
      api.create.mockReturnValue(of(task));
      await type(titleInput(), 'Regar las plantas');
      await toggleRecurring();
      await toggleRecurring();

      await submit();

      expect(api.create).toHaveBeenCalledWith({ title: 'Regar las plantas', recurrence: null });
    });

    it('should stay on the form and keep the data when the API fails', async () => {
      api.create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 422 })));
      await type(titleInput(), 'Comprar pan');

      await submit();

      expect(TestBed.inject(Router).url).toBe('/tasks/new');
      expect(titleInput().value).toBe('Comprar pan');
      expect(element().querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(false);
    });
  });

  describe('edit mode', () => {
    it('should load the task into the form', async () => {
      api.get.mockReturnValue(of(task));

      await harness.navigateByUrl('/tasks/3/edit');

      expect(api.get).toHaveBeenCalledWith(3);
      expect(element().querySelector('h2')?.textContent).toContain('Editar tarea');
      expect(titleInput().value).toBe('Regar las plantas');
      expect(recurringCheck().checked).toBe(true);
      expect(recurrenceSelect()?.value).toBe('monthly');
    });

    it('should update the task and go back to the list', async () => {
      api.get.mockReturnValue(of(task));
      api.update.mockReturnValue(of({ ...task, title: 'Regar el huerto' }));
      await harness.navigateByUrl('/tasks/3/edit');
      await type(titleInput(), 'Regar el huerto');

      await submit();

      expect(api.update).toHaveBeenCalledWith(3, { title: 'Regar el huerto', recurrence: 'monthly' });
      expect(TestBed.inject(Router).url).toBe('/tasks');
      expect(TestBed.inject(MessageService).status()).toBe('Tarea guardada.');
    });

    it('should show a not found message when the task does not exist', async () => {
      api.get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));

      await harness.navigateByUrl('/tasks/99/edit');

      expect(element().textContent).toContain('No se ha encontrado la tarea.');
      expect(element().querySelector('form')).toBeNull();
    });
  });
});
