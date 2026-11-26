import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { errorInterceptor } from '../../../core/interceptors/error.interceptor';
import { MessageService } from '../../../core/messages/message.service';
import { Task } from '../../../core/models/task';
import { TaskList } from './task-list';

// Issue #10: acceptance criteria of the task list. The API is replaced by HttpTestingController.
describe('TaskList', () => {
  let fixture: ComponentFixture<TaskList>;
  let element: HTMLElement;
  let httpTesting: HttpTestingController;
  let messages: MessageService;

  function task(overrides: Partial<Task>): Task {
    return {
      id: 1,
      title: 'Comprar pan',
      completed: false,
      createdAt: '2026-11-24T10:00:00+01:00',
      recurrence: null,
      nextOccurrenceDate: null,
      templateId: null,
      categoryId: null,
      deletedAt: null,
      ...overrides,
    };
  }

  const bread = task({ id: 1, title: 'Comprar pan' });
  const plants = task({ id: 2, title: 'Regar las plantas', recurrence: 'weekly', nextOccurrenceDate: '2026-12-01' });
  const rent = task({ id: 3, title: 'Pagar el alquiler', completed: true, recurrence: 'monthly' });

  async function render(tasks: Task[]): Promise<void> {
    fixture = TestBed.createComponent(TaskList);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    httpTesting.expectOne('/api/tasks').flush(tasks);
    await fixture.whenStable();
  }

  function titles(group: 'pending' | 'completed'): string[] {
    return Array.from(element.querySelectorAll(`[data-testid="${group}"] .task-title`)).map((e) =>
      (e.textContent ?? '').trim(),
    );
  }

  function button(label: string): HTMLButtonElement | null {
    return element.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TaskList],
      providers: [provideRouter([]), provideHttpClient(withInterceptors([errorInterceptor])), provideHttpClientTesting()],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    messages = TestBed.inject(MessageService);
  });

  afterEach(() => {
    httpTesting.verify();
    vi.restoreAllMocks();
  });

  it('should show pending and completed tasks', async () => {
    await render([bread, plants, rent]);

    expect(titles('pending')).toEqual(['Comprar pan', 'Regar las plantas']);
    expect(titles('completed')).toEqual(['Pagar el alquiler']);
    expect(element.textContent).toContain('Pendientes (2)');
    expect(element.textContent).toContain('Completadas (1)');
    expect(element.textContent).toContain('Semanal');
  });

  it('should show the empty state when there are no tasks', async () => {
    await render([]);

    expect(element.textContent).toContain('Todavía no tienes tareas.');
  });

  it('should not show a complete button in completed tasks', async () => {
    await render([bread, rent]);

    expect(button('Completar: Comprar pan')).not.toBeNull();
    expect(button('Completar: Pagar el alquiler')).toBeNull();
  });

  it('should move a completed task to the completed group', async () => {
    await render([bread]);

    button('Completar: Comprar pan')?.click();
    const req = httpTesting.expectOne('/api/tasks/1/complete');
    expect(req.request.method).toBe('POST');
    req.flush({ task: { ...bread, completed: true }, nextOccurrence: null });
    await fixture.whenStable();

    expect(titles('pending')).toEqual([]);
    expect(titles('completed')).toEqual(['Comprar pan']);
    expect(messages.status()).toBe('Tarea completada.');
  });

  it('should show the next occurrence when a recurring task is completed', async () => {
    await render([plants]);

    button('Completar: Regar las plantas')?.click();
    const next = task({ id: 9, title: 'Regar las plantas', recurrence: 'weekly', nextOccurrenceDate: '2026-12-08' });
    httpTesting.expectOne('/api/tasks/2/complete').flush({ task: { ...plants, completed: true }, nextOccurrence: next });
    await fixture.whenStable();

    expect(titles('pending')).toEqual(['Regar las plantas']);
    expect(titles('completed')).toEqual(['Regar las plantas']);
    expect(button('Completar: Regar las plantas')).not.toBeNull();
    expect(messages.status()).toBe('Tarea completada. Se ha creado la siguiente repetición.');
  });

  it('should remove a deleted task from the list', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await render([bread, plants]);

    button('Eliminar: Comprar pan')?.click();
    const req = httpTesting.expectOne('/api/tasks/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();

    expect(titles('pending')).toEqual(['Regar las plantas']);
    expect(messages.status()).toBe('Tarea movida a la papelera.');
  });

  it('should keep the task when the deletion is not confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    await render([bread]);

    button('Eliminar: Comprar pan')?.click();
    httpTesting.expectNone('/api/tasks/1');

    expect(titles('pending')).toEqual(['Comprar pan']);
  });

  it('should show the API message when an action fails', async () => {
    await render([bread]);

    button('Completar: Comprar pan')?.click();
    httpTesting
      .expectOne('/api/tasks/1/complete')
      .flush({ status: 409, detail: 'Task 1 is already completed.' }, { status: 409, statusText: 'Conflict' });
    await fixture.whenStable();

    expect(messages.error()).toBe('La acción no está permitida en el estado actual. (Task 1 is already completed.)');
    expect(titles('pending')).toEqual(['Comprar pan']);
    expect(button('Completar: Comprar pan')?.disabled).toBe(false);
  });

  it('should offer a retry when the list cannot be loaded', async () => {
    fixture = TestBed.createComponent(TaskList);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    httpTesting.expectOne('/api/tasks').flush('Error', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(element.textContent).toContain('No se han podido cargar las tareas.');
    expect(messages.error()).toBe('Ha ocurrido un error inesperado.');

    element.querySelector<HTMLButtonElement>('.empty button')?.click();
    httpTesting.expectOne('/api/tasks').flush([bread]);
    await fixture.whenStable();

    expect(titles('pending')).toEqual(['Comprar pan']);
  });
});
