import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { errorInterceptor } from '../../../core/interceptors/error.interceptor';
import { MessageService } from '../../../core/messages/message.service';
import { Category } from '../../../core/models/category';
import { Task } from '../../../core/models/task';
import { TaskForm } from './task-form';

// Issue #10: acceptance criteria of the task form. The API is replaced by HttpTestingController.
describe('TaskForm', () => {
  let fixture: ComponentFixture<TaskForm>;
  let element: HTMLElement;
  let httpTesting: HttpTestingController;
  let messages: MessageService;
  let navigate: ReturnType<typeof vi.spyOn>;

  const plants: Task = {
    id: 7,
    title: 'Regar las plantas',
    completed: false,
    createdAt: '2026-11-24T10:00:00+01:00',
    recurrence: 'monthly',
    nextOccurrenceDate: '2026-12-24',
    templateId: null,
    categoryId: null,
    deletedAt: null,
  };

  const home: Category = { id: 3, name: 'Casa' };
  const work: Category = { id: 4, name: 'Trabajo' };

  // The form always loads the categories for its selector (issue #15).
  async function render(id: string | null, categories: Category[] = []): Promise<void> {
    TestBed.configureTestingModule({
      imports: [TaskForm],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap(id === null ? {} : { id }) } },
        },
      ],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    messages = TestBed.inject(MessageService);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(TaskForm);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    httpTesting.expectOne('/api/categories').flush(categories);
    await fixture.whenStable();
  }

  function choose(select: HTMLSelectElement, label: string): void {
    const index = Array.from(select.options).findIndex((o) => o.textContent?.trim() === label);
    select.selectedIndex = index;
    select.dispatchEvent(new Event('change'));
  }

  function input<T extends HTMLElement>(selector: string): T {
    return element.querySelector<T>(selector) as T;
  }

  function type(value: string): void {
    const title = input<HTMLInputElement>('#title');
    title.value = value;
    title.dispatchEvent(new Event('input'));
  }

  async function submit(): Promise<void> {
    input<HTMLFormElement>('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  afterEach(() => {
    httpTesting.verify();
    vi.restoreAllMocks();
  });

  it('should show an error and not send the form when the title is empty', async () => {
    await render(null);

    await submit();

    httpTesting.expectNone('/api/tasks');
    expect(element.querySelector('#title-error')?.textContent).toContain('Error: El título es obligatorio.');
    expect(input<HTMLInputElement>('#title').getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement).toBe(input('#title'));
  });

  it('should treat a title with only spaces as empty', async () => {
    await render(null);

    type('   ');
    await submit();

    httpTesting.expectNone('/api/tasks');
    expect(element.querySelector('#title-error')).not.toBeNull();
  });

  it('should create a task without recurrence and go back to the list', async () => {
    await render(null);

    type('Comprar pan');
    await submit();

    const req = httpTesting.expectOne('/api/tasks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'Comprar pan', recurrence: null, categoryId: null });
    req.flush({ ...plants, id: 8, title: 'Comprar pan', recurrence: null }, { status: 201, statusText: 'Created' });
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith(['/tasks']);
    expect(messages.status()).toBe('Tarea creada.');
  });

  it('should send the selected recurrence when the task is recurring', async () => {
    await render(null);

    type('Regar las plantas');
    input<HTMLInputElement>('input[type="checkbox"]').click();
    await fixture.whenStable();
    const select = input<HTMLSelectElement>('#recurrence');
    expect(select.value).toBe('weekly');
    select.value = 'daily';
    select.dispatchEvent(new Event('change'));
    await submit();

    const req = httpTesting.expectOne('/api/tasks');
    expect(req.request.body).toEqual({ title: 'Regar las plantas', recurrence: 'daily', categoryId: null });
    req.flush(plants, { status: 201, statusText: 'Created' });
  });

  it('should load the task and update it in edit mode', async () => {
    await render('7');
    httpTesting.expectOne('/api/tasks/7').flush(plants);
    await fixture.whenStable();

    expect(element.querySelector('h2')?.textContent).toContain('Editar tarea');
    expect(input<HTMLInputElement>('#title').value).toBe('Regar las plantas');
    expect(input<HTMLSelectElement>('#recurrence').value).toBe('monthly');

    input<HTMLInputElement>('input[type="checkbox"]').click();
    await fixture.whenStable();
    await submit();

    const req = httpTesting.expectOne('/api/tasks/7');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ title: 'Regar las plantas', recurrence: null, categoryId: null });
    req.flush({ ...plants, recurrence: null, nextOccurrenceDate: null });
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith(['/tasks']);
    expect(messages.status()).toBe('Tarea guardada.');
  });

  it('should show a not found message when the task does not exist', async () => {
    await render('99');
    httpTesting.expectOne('/api/tasks/99').flush({ status: 404 }, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();

    expect(element.textContent).toContain('No se ha encontrado la tarea.');
    expect(element.querySelector('form')).toBeNull();
  });

  it('should show the API message and stay on the form when saving fails', async () => {
    await render(null);

    type('Comprar pan');
    await submit();
    httpTesting.expectOne('/api/tasks').flush(
      { status: 422, violations: [{ propertyPath: 'title', title: 'This value is too long.' }] },
      { status: 422, statusText: 'Unprocessable Content' },
    );
    await fixture.whenStable();

    expect(messages.error()).toBe('Revisa los datos: This value is too long.');
    expect(navigate).not.toHaveBeenCalled();
    expect(input<HTMLInputElement>('#title').value).toBe('Comprar pan');
    expect(input<HTMLButtonElement>('button[type="submit"]').disabled).toBe(false);
  });
  // Issue #15 (criterion 11): category selector.
  it('should list the categories and send the chosen categoryId', async () => {
    await render(null, [home, work]);

    const select = input<HTMLSelectElement>('#category');
    expect(Array.from(select.options).map((o) => o.textContent?.trim())).toEqual(['Sin categoría', 'Casa', 'Trabajo']);

    type('Comprar pan');
    choose(select, 'Trabajo');
    await submit();

    const req = httpTesting.expectOne('/api/tasks');
    expect(req.request.body).toEqual({ title: 'Comprar pan', recurrence: null, categoryId: 4 });
    req.flush({ ...plants, id: 8, title: 'Comprar pan', recurrence: null, categoryId: 4 }, { status: 201, statusText: 'Created' });
  });

  it('should preselect the current category when editing', async () => {
    await render('7', [home, work]);
    httpTesting.expectOne('/api/tasks/7').flush({ ...plants, categoryId: 3 });
    await fixture.whenStable();

    const select = input<HTMLSelectElement>('#category');
    expect(select.options[select.selectedIndex].textContent?.trim()).toBe('Casa');

    // Saving without touching the selector keeps the category (PUT replaces the task).
    await submit();
    const req = httpTesting.expectOne('/api/tasks/7');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ title: 'Regar las plantas', recurrence: 'monthly', categoryId: 3 });
    req.flush({ ...plants, categoryId: 3 });
  });

  it('should send categoryId null when "Sin categoría" is chosen', async () => {
    await render('7', [home, work]);
    httpTesting.expectOne('/api/tasks/7').flush({ ...plants, categoryId: 3 });
    await fixture.whenStable();

    choose(input<HTMLSelectElement>('#category'), 'Sin categoría');
    await submit();

    const req = httpTesting.expectOne('/api/tasks/7');
    expect(req.request.body).toEqual({ title: 'Regar las plantas', recurrence: 'monthly', categoryId: null });
    req.flush(plants);
  });
});
