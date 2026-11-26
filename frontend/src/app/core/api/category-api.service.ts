import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Category, CategoryInput } from '../models/category';

// F-15 to F-18: one method per endpoint of /api/categories (docs/analisis.md §4).
@Injectable({ providedIn: 'root' })
export class CategoryApiService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/categories';

  list(): Observable<Category[]> {
    return this.http.get<Category[]>(this.url);
  }

  create(input: CategoryInput): Observable<Category> {
    return this.http.post<Category>(this.url, input);
  }

  // F-17: rename (PUT replaces the only editable field, the name).
  update(id: number, input: CategoryInput): Observable<Category> {
    return this.http.put<Category>(`${this.url}/${id}`, input);
  }

  // F-18, RN-16: the API answers 409 when the category has tasks.
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
