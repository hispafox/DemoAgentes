import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { errorInterceptor } from '../../../core/interceptors/error.interceptor';
import { MessageService } from '../../../core/messages/message.service';
import { Task } from '../../../core/models/task';
import { TaskTrash } from './task-trash';

// Issue #11: acceptance criteria of the trash screen. The API is replaced by HttpTestingController.
describe('TaskTrash', () => {
  let fixture: ComponentFixture<TaskTrash>;
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
      deletedAt: '2026-11-25T18:30:00+01:00',
      ...overrides,
    };
  }

  const bread = task({ id: 1, title: 'Comprar pan' });
  const rent = task({ id: 3, title: 'Pagar el alquiler', completed: true });

  async function render(tasks: Task[]): Promise<void> {
    fixture = TestBed.createComponent(TaskTrash);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    httpTesting.expectOne('/api/tasks/trash').flush(tasks);
    await fixture.whenStable();
  }

  function titles(): string[] {
    return Array.from(element.querySelectorAll('[data-testid="trash"] .task-title')).map((e) =>
      (e.textContent ?? '').trim(),
    );
  }

  function button(label: string): HTMLButtonElement | null {
    return element.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TaskTrash],
      providers: [provideRouter([]), provideHttpClient(withInterceptors([errorInterceptor])), provideHttpClientTesting()],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    messages = TestBed.inject(MessageService);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should list the tasks returned by the trash endpoint', async () => {
    await render([bread, rent]);

    expect(titles()).toEqual(['Comprar pan', 'Pagar el alquiler']);
    expect(element.textContent).toContain('Pendiente');
    expect(element.textContent).toContain('Completada');
    expect(element.textContent).toContain('Eliminada el');
  });

  it('should only offer the restore action (RN-13)', async () => {
    await render([bread]);

    expect(button('Restaurar: Comprar pan')).not.toBeNull();
    expect(button('Completar: Comprar pan')).toBeNull();
    expect(element.querySelector('a[aria-label="Editar: Comprar pan"]')).toBeNull();
  });

  it('should show an empty message when the trash has no tasks', async () => {
    await render([]);

    expect(element.textContent).toContain('La papelera está vacía.');
  });

  it('should show a retry button when loading fails', async () => {
    fixture = TestBed.createComponent(TaskTrash);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    httpTesting.expectOne('/api/tasks/trash').flush('Error', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(element.textContent).toContain('No se ha podido cargar la papelera.');

    element.querySelector<HTMLButtonElement>('.empty button')?.click();
    httpTesting.expectOne('/api/tasks/trash').flush([bread]);
    await fixture.whenStable();

    expect(titles()).toEqual(['Comprar pan']);
  });

  it('should call POST restore and remove the row when restoring a task', async () => {
    await render([bread, rent]);

    button('Restaurar: Comprar pan')?.click();
    const req = httpTesting.expectOne('/api/tasks/1/restore');
    expect(req.request.method).toBe('POST');
    req.flush({ ...bread, deletedAt: null });
    await fixture.whenStable();

    expect(titles()).toEqual(['Pagar el alquiler']);
    expect(messages.status()).toBe('Tarea restaurada.');
  });

  it('should keep the row and re-enable the button when restore fails', async () => {
    await render([bread]);

    button('Restaurar: Comprar pan')?.click();
    await fixture.whenStable();
    expect(button('Restaurar: Comprar pan')?.disabled).toBe(true);
    httpTesting.expectOne('/api/tasks/1/restore').flush('Error', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(titles()).toEqual(['Comprar pan']);
    expect(button('Restaurar: Comprar pan')?.disabled).toBe(false);
    expect(messages.error()).toBe('Ha ocurrido un error inesperado.');
  });

  it('should show the API message and reload the trash when restore returns 409', async () => {
    await render([bread, rent]);

    button('Restaurar: Comprar pan')?.click();
    httpTesting
      .expectOne('/api/tasks/1/restore')
      .flush({ status: 409, detail: 'Task 1 is not in the trash.' }, { status: 409, statusText: 'Conflict' });
    await fixture.whenStable();

    expect(messages.error()).toBe('La acción no está permitida en el estado actual. (Task 1 is not in the trash.)');
    httpTesting.expectOne('/api/tasks/trash').flush([rent]);
    await fixture.whenStable();

    expect(titles()).toEqual(['Pagar el alquiler']);
  });
});
