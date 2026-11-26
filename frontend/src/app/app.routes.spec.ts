import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { TaskList } from './features/tasks/task-list/task-list';
import { TaskTrash } from './features/tasks/task-trash/task-trash';
import { Task } from './core/models/task';
import { TemplateForm } from './features/task-templates/template-form/template-form';
import { TemplateList } from './features/task-templates/template-list/template-list';

// Issues #11 and #12: trash and template routes, and the way back to the task list.
describe('routes', () => {
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should resolve /tasks/trash to TaskTrash', async () => {
    const harness = await RouterTestingHarness.create();

    const screen = await harness.navigateByUrl('/tasks/trash', TaskTrash);
    httpTesting.expectOne('/api/tasks/trash').flush([]);

    expect(screen).toBeInstanceOf(TaskTrash);
  });

  it('should reload the task list when going from /tasks/trash to /tasks', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/tasks/trash', TaskTrash);
    httpTesting.expectOne('/api/tasks/trash').flush([]);

    const screen = await harness.navigateByUrl('/tasks', TaskList);
    const req = httpTesting.expectOne('/api/tasks');
    expect(req.request.method).toBe('GET');
    req.flush([]);

    expect(screen).toBeInstanceOf(TaskList);
  });

  // Issue #12: the template screens and the way to the new task.
  it('should resolve /templates to TemplateList', async () => {
    const harness = await RouterTestingHarness.create();

    const screen = await harness.navigateByUrl('/templates', TemplateList);
    httpTesting.expectOne('/api/task-templates').flush([]);

    expect(screen).toBeInstanceOf(TemplateList);
  });

  it('should resolve /templates/new and /templates/:id/edit to TemplateForm', async () => {
    const harness = await RouterTestingHarness.create();

    expect(await harness.navigateByUrl('/templates/new', TemplateForm)).toBeInstanceOf(TemplateForm);

    const edit = await harness.navigateByUrl('/templates/4/edit', TemplateForm);
    httpTesting.expectOne('/api/task-templates/4').flush({ id: 4, title: 'Revisar el correo', recurrence: null });
    expect(edit).toBeInstanceOf(TemplateForm);
  });

  it('should show the new task in /tasks after instantiating', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/templates', TemplateList);
    httpTesting.expectOne('/api/task-templates').flush([{ id: 4, title: 'Revisar el correo', recurrence: null }]);
    harness.detectChanges();

    harness.routeNativeElement?.querySelector<HTMLButtonElement>('button[aria-label="Crear tarea: Revisar el correo"]')?.click();
    httpTesting.expectOne('/api/task-templates/4/instantiate').flush(newTask, { status: 201, statusText: 'Created' });
    await harness.fixture.whenStable();

    const req = httpTesting.expectOne('/api/tasks');
    expect(req.request.method).toBe('GET');
    req.flush([newTask]);
    await harness.fixture.whenStable();

    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(TaskList);
    expect(harness.routeNativeElement?.textContent).toContain('Revisar el correo');
  });
});

const newTask: Task = {
  id: 20,
  title: 'Revisar el correo',
  completed: false,
  createdAt: '2026-11-26T10:00:00+01:00',
  recurrence: null,
  nextOccurrenceDate: null,
  templateId: 4,
  deletedAt: null,
};
