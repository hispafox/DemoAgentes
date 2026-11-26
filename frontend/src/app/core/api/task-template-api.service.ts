import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../models/task';
import { TaskTemplate, TaskTemplateInput } from '../models/task-template';

// F-07 to F-12: one method per endpoint of /api/task-templates (docs/analisis.md §4).
@Injectable({ providedIn: 'root' })
export class TaskTemplateApiService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/task-templates';

  list(): Observable<TaskTemplate[]> {
    return this.http.get<TaskTemplate[]>(this.url);
  }

  get(id: number): Observable<TaskTemplate> {
    return this.http.get<TaskTemplate>(`${this.url}/${id}`);
  }

  create(input: TaskTemplateInput): Observable<TaskTemplate> {
    return this.http.post<TaskTemplate>(this.url, input);
  }

  update(id: number, input: TaskTemplateInput): Observable<TaskTemplate> {
    return this.http.put<TaskTemplate>(`${this.url}/${id}`, input);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  // F-12, RN-08: the API creates the task linked to the template and returns it.
  instantiate(id: number): Observable<Task> {
    return this.http.post<Task>(`${this.url}/${id}/instantiate`, null);
  }
}
