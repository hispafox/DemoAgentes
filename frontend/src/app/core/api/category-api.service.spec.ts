import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Category } from '../models/category';
import { CategoryApiService } from './category-api.service';

// Issue #15: each method calls the verb and path of docs/analisis.md §4.
describe('CategoryApiService', () => {
  let service: CategoryApiService;
  let httpTesting: HttpTestingController;

  const home: Category = { id: 3, name: 'Casa' };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CategoryApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should GET /api/categories when listing', () => {
    let result: Category[] | undefined;
    service.list().subscribe((categories) => (result = categories));

    const req = httpTesting.expectOne('/api/categories');
    expect(req.request.method).toBe('GET');
    req.flush([home]);
    expect(result).toEqual([home]);
  });

  it('should POST a new category with its name', () => {
    let result: Category | undefined;
    service.create({ name: 'Casa' }).subscribe((category) => (result = category));

    const req = httpTesting.expectOne('/api/categories');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Casa' });
    req.flush(home, { status: 201, statusText: 'Created' });
    expect(result).toEqual(home);
  });

  it('should PUT the new name when updating', () => {
    service.update(3, { name: 'Hogar' }).subscribe();

    const req = httpTesting.expectOne('/api/categories/3');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ name: 'Hogar' });
  });

  it('should DELETE a category', () => {
    service.delete(3).subscribe();

    expect(httpTesting.expectOne('/api/categories/3').request.method).toBe('DELETE');
  });
});
