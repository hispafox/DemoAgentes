import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CompleteTaskResult, Task, TaskInput } from '../models/task';

// F-01 to F-06, F-13 and F-14: one method per endpoint of /api/tasks (docs/analisis.md §4).
@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/tasks';

  list(): Observable<Task[]> {
    return this.http.get<Task[]>(this.url);
  }

  get(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.url}/${id}`);
  }

  create(input: TaskInput): Observable<Task> {
    return this.http.post<Task>(this.url, input);
  }

  update(id: number, input: TaskInput): Observable<Task> {
    return this.http.put<Task>(`${this.url}/${id}`, input);
  }

  complete(id: number): Observable<CompleteTaskResult> {
    return this.http.post<CompleteTaskResult>(`${this.url}/${id}/complete`, null);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  trash(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.url}/trash`);
  }

  restore(id: number): Observable<Task> {
    return this.http.post<Task>(`${this.url}/${id}/restore`, null);
  }
}
