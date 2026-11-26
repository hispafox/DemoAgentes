import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TaskTemplate } from '../models/task-template';
import { TaskTemplateApiService } from './task-template-api.service';

// Issue #12: each method calls the verb and path of docs/analisis.md §4.
describe('TaskTemplateApiService', () => {
  let service: TaskTemplateApiService;
  let httpTesting: HttpTestingController;

  const template: TaskTemplate = { id: 4, title: 'Revisar el correo', recurrence: 'daily' };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(TaskTemplateApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should GET /api/task-templates when listing', () => {
    let result: TaskTemplate[] | undefined;
    service.list().subscribe((templates) => (result = templates));

    const req = httpTesting.expectOne('/api/task-templates');
    expect(req.request.method).toBe('GET');
    req.flush([template]);
    expect(result).toEqual([template]);
  });

  it('should GET one template', () => {
    service.get(4).subscribe();

    expect(httpTesting.expectOne('/api/task-templates/4').request.method).toBe('GET');
  });

  it('should POST a new template with its input', () => {
    service.create({ title: 'Revisar el correo', recurrence: null }).subscribe();

    const req = httpTesting.expectOne('/api/task-templates');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'Revisar el correo', recurrence: null });
  });

  it('should PUT a template when updating', () => {
    service.update(4, { title: 'Revisar', recurrence: 'weekly' }).subscribe();

    const req = httpTesting.expectOne('/api/task-templates/4');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ title: 'Revisar', recurrence: 'weekly' });
  });

  it('should DELETE a template', () => {
    service.delete(4).subscribe();

    expect(httpTesting.expectOne('/api/task-templates/4').request.method).toBe('DELETE');
  });

  it('should POST instantiate to create a task from a template', () => {
    service.instantiate(4).subscribe();

    expect(httpTesting.expectOne('/api/task-templates/4/instantiate').request.method).toBe('POST');
  });
});
