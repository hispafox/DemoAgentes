import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CompleteTaskResult, Task } from '../models/task';
import { TaskApiService } from './task-api.service';

const task: Task = {
  id: 1,
  title: 'Comprar pan',
  completed: false,
  createdAt: '2026-11-26T10:00:00+00:00',
  recurrence: null,
  nextOccurrenceDate: null,
  templateId: null,
  deletedAt: null,
};

describe('TaskApiService', () => {
  let api: TaskApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(TaskApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should list the tasks with GET /api/tasks', () => {
    let received: Task[] | undefined;
    api.list().subscribe((tasks) => (received = tasks));

    const req = httpTesting.expectOne('/api/tasks');
    expect(req.request.method).toBe('GET');
    req.flush([task]);

    expect(received).toEqual([task]);
  });

  it('should get a task with GET /api/tasks/{id}', () => {
    api.get(1).subscribe();

    const req = httpTesting.expectOne('/api/tasks/1');
    expect(req.request.method).toBe('GET');
    req.flush(task);
  });

  it('should create a task with POST /api/tasks', () => {
    api.create({ title: 'Comprar pan', recurrence: null }).subscribe();

    const req = httpTesting.expectOne('/api/tasks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'Comprar pan', recurrence: null });
    req.flush(task, { status: 201, statusText: 'Created' });
  });

  it('should update a task with PUT /api/tasks/{id}', () => {
    api.update(1, { title: 'Comprar fruta', recurrence: 'weekly' }).subscribe();

    const req = httpTesting.expectOne('/api/tasks/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ title: 'Comprar fruta', recurrence: 'weekly' });
    req.flush({ ...task, title: 'Comprar fruta', recurrence: 'weekly' });
  });

  it('should move a task to the trash with DELETE /api/tasks/{id}', () => {
    api.delete(1).subscribe();

    const req = httpTesting.expectOne('/api/tasks/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('should complete a task with POST /api/tasks/{id}/complete', () => {
    const result: CompleteTaskResult = { task: { ...task, completed: true }, nextOccurrence: null };
    let received: CompleteTaskResult | undefined;
    api.complete(1).subscribe((r) => (received = r));

    const req = httpTesting.expectOne('/api/tasks/1/complete');
    expect(req.request.method).toBe('POST');
    req.flush(result);

    expect(received).toEqual(result);
  });
});
