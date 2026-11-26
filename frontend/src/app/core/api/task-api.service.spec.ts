import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Task } from '../models/task';
import { TaskApiService } from './task-api.service';

describe('TaskApiService', () => {
  let service: TaskApiService;
  let httpTesting: HttpTestingController;

  const task: Task = {
    id: 7,
    title: 'Regar las plantas',
    completed: false,
    createdAt: '2026-11-24T10:00:00+01:00',
    recurrence: 'weekly',
    nextOccurrenceDate: '2026-12-01',
    templateId: null,
    categoryId: null,
    deletedAt: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(TaskApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should list the active tasks', () => {
    let result: Task[] | undefined;
    service.list().subscribe((tasks) => (result = tasks));

    const req = httpTesting.expectOne('/api/tasks');
    expect(req.request.method).toBe('GET');
    req.flush([task]);
    expect(result).toEqual([task]);
  });

  it('should get one task', () => {
    service.get(7).subscribe();

    expect(httpTesting.expectOne('/api/tasks/7').request.method).toBe('GET');
  });

  it('should create a task with its input', () => {
    service.create({ title: 'Comprar pan', recurrence: null, categoryId: null }).subscribe();

    const req = httpTesting.expectOne('/api/tasks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'Comprar pan', recurrence: null, categoryId: null });
  });

  it('should update a task', () => {
    service.update(7, { title: 'Regar', recurrence: 'daily', categoryId: 3 }).subscribe();

    const req = httpTesting.expectOne('/api/tasks/7');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ title: 'Regar', recurrence: 'daily', categoryId: 3 });
  });

  it('should complete a task', () => {
    service.complete(7).subscribe();

    expect(httpTesting.expectOne('/api/tasks/7/complete').request.method).toBe('POST');
  });

  it('should move a task to the trash', () => {
    service.delete(7).subscribe();

    expect(httpTesting.expectOne('/api/tasks/7').request.method).toBe('DELETE');
  });

  it('should list the trash', () => {
    service.trash().subscribe();

    expect(httpTesting.expectOne('/api/tasks/trash').request.method).toBe('GET');
  });

  it('should restore a task', () => {
    service.restore(7).subscribe();

    expect(httpTesting.expectOne('/api/tasks/7/restore').request.method).toBe('POST');
  });
});
