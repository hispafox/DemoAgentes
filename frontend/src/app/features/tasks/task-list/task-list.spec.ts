import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import localeEs from '@angular/common/locales/es';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { TaskApiService } from '../../../core/api/task-api.service';
import { errorInterceptor } from '../../../core/interceptors/error.interceptor';
import { MessageService } from '../../../core/messages/message.service';
import { CompleteTaskResult, Task } from '../../../core/models/task';
import { TaskList } from './task-list';

registerLocaleData(localeEs);

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 1,
    title: 'Comprar pan',
    completed: false,
    createdAt: '2026-11-26T10:00:00+00:00',
    recurrence: null,
    nextOccurrenceDate: null,
    templateId: null,
    deletedAt: null,
    ...overrides,
  };
}

const bread = makeTask({ id: 1, title: 'Comprar pan' });
const plants = makeTask({ id: 3, title: 'Regar las plantas', recurrence: 'weekly', nextOccurrenceDate: '2026-12-03' });
const rent = makeTask({ id: 2, title: 'Pagar el alquiler', completed: true, recurrence: 'monthly' });

interface TaskApiStub {
  list: ReturnType<typeof vi.fn<() => Observable<Task[]>>>;
  complete: ReturnType<typeof vi.fn<(id: number) => Observable<CompleteTaskResult>>>;
  delete: ReturnType<typeof vi.fn<(id: number) => Observable<void>>>;
}

describe('TaskList', () => {
  let api: TaskApiStub;
  let fixture: ComponentFixture<TaskList>;
  let element: HTMLElement;

  async function render(tasks: Task[]): Promise<void> {
    api.list.mockReturnValue(of(tasks));
    fixture = TestBed.createComponent(TaskList);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  }

  function rows(testId: 'pending-task' | 'done-task'): HTMLElement[] {
    return Array.from(element.querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`));
  }

  function button(row: HTMLElement, text: string): HTMLButtonElement | undefined {
    return Array.from(row.querySelectorAll('button')).find((b) => b.textContent?.trim() === text);
  }

  beforeEach(async () => {
    api = { list: vi.fn(), complete: vi.fn(), delete: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [TaskList],
      providers: [
        provideRouter([]),
        { provide: TaskApiService, useValue: api },
        { provide: LOCALE_ID, useValue: 'es' },
      ],
    }).compileComponents();
  });

  afterEach(() => vi.restoreAllMocks());

  it('should show the pending and the completed tasks', async () => {
    await render([bread, plants, rent]);

    expect(element.querySelector('#pending-title')?.textContent).toContain('Pendientes (2)');
    expect(element.querySelector('#done-title')?.textContent).toContain('Completadas (1)');
    expect(rows('pending-task').map((r) => r.querySelector('.task-title')?.textContent)).toEqual([
      'Comprar pan',
      'Regar las plantas',
    ]);
    expect(rows('done-task')[0].textContent).toContain('Completada');
  });

  it('should show the recurrence and the next occurrence date', async () => {
    await render([plants]);

    const row = rows('pending-task')[0];
    expect(row.querySelector('.badge-info')?.textContent).toContain('Semanal');
    expect(row.querySelector('.task-meta')?.textContent).toMatch(/Próxima: 3 dic\.? 2026/);
  });

  it('should not show a complete button on completed tasks', async () => {
    await render([bread, rent]);

    expect(button(rows('pending-task')[0], 'Completar')).toBeDefined();
    expect(button(rows('done-task')[0], 'Completar')).toBeUndefined();
  });

  it('should move a completed task to the completed group', async () => {
    await render([bread]);
    api.complete.mockReturnValue(of({ task: { ...bread, completed: true }, nextOccurrence: null }));

    button(rows('pending-task')[0], 'Completar')?.click();
    await fixture.whenStable();

    expect(api.complete).toHaveBeenCalledWith(1);
    expect(rows('pending-task')).toHaveLength(0);
    expect(element.textContent).toContain('No tienes tareas pendientes.');
    expect(rows('done-task')[0].textContent).toContain('Comprar pan');
    expect(TestBed.inject(MessageService).status()).toBe('Tarea completada.');
  });

  it('should show the next occurrence of a recurring task in the pending group', async () => {
    await render([plants]);
    const next = makeTask({ id: 9, title: 'Regar las plantas', recurrence: 'weekly', nextOccurrenceDate: '2026-12-10' });
    api.complete.mockReturnValue(of({ task: { ...plants, completed: true }, nextOccurrence: next }));

    button(rows('pending-task')[0], 'Completar')?.click();
    await fixture.whenStable();

    expect(rows('done-task')).toHaveLength(1);
    expect(rows('pending-task')).toHaveLength(1);
    expect(rows('pending-task')[0].querySelector('.task-meta')?.textContent).toMatch(/10 dic\.? 2026/);
    expect(TestBed.inject(MessageService).status()).toBe('Tarea completada. Se ha creado la siguiente repetición.');
  });

  it('should remove a task from the list when the deletion is confirmed', async () => {
    await render([bread, plants]);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    api.delete.mockReturnValue(of(undefined));

    button(rows('pending-task')[0], 'Eliminar')?.click();
    await fixture.whenStable();

    expect(confirmSpy).toHaveBeenCalledWith(
      '¿Mover «Comprar pan» a la papelera? Podrás restaurarla desde la papelera.',
    );
    expect(api.delete).toHaveBeenCalledWith(1);
    expect(rows('pending-task').map((r) => r.querySelector('.task-title')?.textContent)).toEqual([
      'Regar las plantas',
    ]);
    expect(TestBed.inject(MessageService).status()).toBe('Tarea movida a la papelera.');
  });

  it('should do nothing when the deletion is cancelled', async () => {
    await render([bread]);
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    button(rows('pending-task')[0], 'Eliminar')?.click();
    await fixture.whenStable();

    expect(api.delete).not.toHaveBeenCalled();
    expect(rows('pending-task')).toHaveLength(1);
  });

  it('should keep the task when the API fails to delete it', async () => {
    await render([bread]);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    api.delete.mockReturnValue(throwError(() => new Error('API error')));

    button(rows('pending-task')[0], 'Eliminar')?.click();
    await fixture.whenStable();

    expect(rows('pending-task')).toHaveLength(1);
    expect(button(rows('pending-task')[0], 'Eliminar')?.disabled).toBe(false);
  });

  it('should show the empty state when there are no tasks', async () => {
    await render([]);

    expect(element.textContent).toContain('Todavía no tienes tareas.');
    expect(element.querySelector('a[href="/tasks/new"]')).not.toBeNull();
    expect(element.querySelector('#pending-title')).toBeNull();
  });

  it('should hide the completed group when there are no completed tasks', async () => {
    await render([bread]);

    expect(element.querySelector('#done-title')).toBeNull();
  });
});

// Criterion 5: an API error reaches the MessageService through the real interceptor.
describe('TaskList with the API failing', () => {
  it('should show the load error and publish the API message', async () => {
    TestBed.configureTestingModule({
      imports: [TaskList],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    const fixture = TestBed.createComponent(TaskList);
    const httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    httpTesting.expectOne('/api/tasks').flush('Internal Server Error', { status: 500, statusText: 'Error' });
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(TestBed.inject(MessageService).error()).toBe('Ha ocurrido un error inesperado.');
    expect(element.textContent).toContain('No se han podido cargar las tareas.');
    expect(Array.from(element.querySelectorAll('button')).some((b) => b.textContent?.includes('Reintentar'))).toBe(
      true,
    );
    httpTesting.verify();
  });
});
