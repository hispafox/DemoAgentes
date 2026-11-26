import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { TaskList } from './features/tasks/task-list/task-list';
import { TaskTrash } from './features/tasks/task-trash/task-trash';

// Issue #11: the trash route and the way back to the task list.
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
});
