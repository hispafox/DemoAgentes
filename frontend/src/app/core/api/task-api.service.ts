import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CompleteTaskResult, Task, TaskInput } from '../models/task';

// F-01, F-03 to F-06: calls to /api/tasks (docs/analisis.md §4).
// The trash endpoints (F-13, F-14) arrive with issue #11.
@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/tasks';

  list(): Observable<Task[]> {
    return this.http.get<Task[]>(this.baseUrl);
  }

  get(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${id}`);
  }

  create(input: TaskInput): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, input);
  }

  update(id: number, input: TaskInput): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${id}`, input);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  complete(id: number): Observable<CompleteTaskResult> {
    return this.http.post<CompleteTaskResult>(`${this.baseUrl}/${id}/complete`, null);
  }
}
