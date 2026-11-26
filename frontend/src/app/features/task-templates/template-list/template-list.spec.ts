import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { errorInterceptor } from '../../../core/interceptors/error.interceptor';
import { MessageService } from '../../../core/messages/message.service';
import { Task } from '../../../core/models/task';
import { TaskTemplate } from '../../../core/models/task-template';
import { TemplateList } from './template-list';

// Issue #12: acceptance criteria of the template list. The API is replaced by HttpTestingController.
describe('TemplateList', () => {
  let fixture: ComponentFixture<TemplateList>;
  let element: HTMLElement;
  let httpTesting: HttpTestingController;
  let messages: MessageService;
  let navigate: ReturnType<typeof vi.spyOn>;

  const mail: TaskTemplate = { id: 4, title: 'Revisar el correo', recurrence: 'daily' };
  const shopping: TaskTemplate = { id: 5, title: 'Hacer la compra', recurrence: null };

  async function render(templates: TaskTemplate[]): Promise<void> {
    fixture = TestBed.createComponent(TemplateList);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    httpTesting.expectOne('/api/task-templates').flush(templates);
    await fixture.whenStable();
  }

  function titles(): string[] {
    return Array.from(element.querySelectorAll('[data-testid="templates"] .template-title')).map((e) =>
      (e.textContent ?? '').trim(),
    );
  }

  function control(label: string): HTMLElement | null {
    return element.querySelector<HTMLElement>(`[aria-label="${label}"]`);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemplateList],
      providers: [provideRouter([]), provideHttpClient(withInterceptors([errorInterceptor])), provideHttpClientTesting()],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    messages = TestBed.inject(MessageService);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    httpTesting.verify();
    vi.restoreAllMocks();
  });

  it('should list the templates with create task, edit and delete buttons', async () => {
    await render([mail, shopping]);

    expect(titles()).toEqual(['Revisar el correo', 'Hacer la compra']);
    expect(element.textContent).toContain('Diaria');
    for (const title of ['Revisar el correo', 'Hacer la compra']) {
      expect(control(`Crear tarea: ${title}`)).not.toBeNull();
      expect(control(`Editar: ${title}`)).not.toBeNull();
      expect(control(`Eliminar: ${title}`)).not.toBeNull();
    }
    expect(control('Editar: Revisar el correo')?.getAttribute('href')).toBe('/templates/4/edit');
  });

  it('should show an empty message when there are no templates', async () => {
    await render([]);

    expect(element.textContent).toContain('Todavía no tienes plantillas.');
  });

  it('should show a retry button when loading fails', async () => {
    fixture = TestBed.createComponent(TemplateList);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    httpTesting.expectOne('/api/task-templates').flush('Error', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(element.textContent).toContain('No se han podido cargar las plantillas.');

    element.querySelector<HTMLButtonElement>('.empty button')?.click();
    httpTesting.expectOne('/api/task-templates').flush([mail]);
    await fixture.whenStable();

    expect(titles()).toEqual(['Revisar el correo']);
  });

  it('should call POST instantiate and navigate to /tasks when creating a task', async () => {
    await render([mail]);

    control('Crear tarea: Revisar el correo')?.click();
    const req = httpTesting.expectOne('/api/task-templates/4/instantiate');
    expect(req.request.method).toBe('POST');
    const task: Task = {
      id: 20,
      title: 'Revisar el correo',
      completed: false,
      createdAt: '2026-11-26T10:00:00+01:00',
      recurrence: 'daily',
      nextOccurrenceDate: '2026-11-27',
      templateId: 4,
      deletedAt: null,
    };
    req.flush(task, { status: 201, statusText: 'Created' });
    await fixture.whenStable();

    expect(messages.status()).toBe('Tarea creada.');
    expect(navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('should remove the row when the template is deleted', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await render([mail, shopping]);

    control('Eliminar: Revisar el correo')?.click();
    const req = httpTesting.expectOne('/api/task-templates/4');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();

    expect(titles()).toEqual(['Hacer la compra']);
    expect(messages.status()).toBe('Plantilla eliminada.');
  });

  it('should keep the template when the deletion is not confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    await render([mail]);

    control('Eliminar: Revisar el correo')?.click();
    httpTesting.expectNone('/api/task-templates/4');

    expect(titles()).toEqual(['Revisar el correo']);
  });

  it('should keep the row and show the 409 notice when the template has tasks', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await render([mail]);

    control('Eliminar: Revisar el correo')?.click();
    httpTesting
      .expectOne('/api/task-templates/4')
      .flush({ status: 409, detail: 'Template 4 has tasks.' }, { status: 409, statusText: 'Conflict' });
    await fixture.whenStable();

    expect(messages.error()).toBe('Esta plantilla tiene tareas asociadas y no se puede eliminar');
    expect(titles()).toEqual(['Revisar el correo']);
    expect((control('Eliminar: Revisar el correo') as HTMLButtonElement).disabled).toBe(false);
  });
});
