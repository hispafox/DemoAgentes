import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { errorInterceptor } from '../../../core/interceptors/error.interceptor';
import { MessageService } from '../../../core/messages/message.service';
import { Category } from '../../../core/models/category';
import { CategoryList } from './category-list';

// Issue #15 (criterion 10): list, create, rename and delete categories, with the 409 and 422 notices.
describe('CategoryList', () => {
  let fixture: ComponentFixture<CategoryList>;
  let element: HTMLElement;
  let httpTesting: HttpTestingController;
  let messages: MessageService;

  const home: Category = { id: 3, name: 'Casa' };
  const work: Category = { id: 4, name: 'Trabajo' };

  async function render(categories: Category[]): Promise<void> {
    fixture = TestBed.createComponent(CategoryList);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    httpTesting.expectOne('/api/categories').flush(categories);
    await fixture.whenStable();
  }

  function names(): string[] {
    return Array.from(element.querySelectorAll('[data-testid="categories"] .category-name')).map((e) =>
      (e.textContent ?? '').trim(),
    );
  }

  function control<T extends HTMLElement>(label: string): T | null {
    return element.querySelector<T>(`[aria-label="${label}"]`);
  }

  function type(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  async function submit(form: HTMLFormElement | null): Promise<void> {
    form?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  function newNameInput(): HTMLInputElement {
    return element.querySelector<HTMLInputElement>('#new-name') as HTMLInputElement;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CategoryList],
      providers: [provideHttpClient(withInterceptors([errorInterceptor])), provideHttpClientTesting()],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    messages = TestBed.inject(MessageService);
  });

  afterEach(() => {
    httpTesting.verify();
    vi.restoreAllMocks();
  });

  it('should list the categories', async () => {
    await render([home, work]);

    expect(names()).toEqual(['Casa', 'Trabajo']);
    for (const name of ['Casa', 'Trabajo']) {
      expect(control(`Editar: ${name}`)).not.toBeNull();
      expect(control(`Eliminar: ${name}`)).not.toBeNull();
    }
  });

  it('should show an empty message when there are no categories', async () => {
    await render([]);

    expect(element.textContent).toContain('Todavía no tienes categorías.');
  });

  it('should show a retry button when loading fails', async () => {
    fixture = TestBed.createComponent(CategoryList);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    httpTesting.expectOne('/api/categories').flush('Error', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(element.textContent).toContain('No se han podido cargar las categorías.');

    element.querySelector<HTMLButtonElement>('.empty button')?.click();
    httpTesting.expectOne('/api/categories').flush([home]);
    await fixture.whenStable();

    expect(names()).toEqual(['Casa']);
  });

  it('should create a category and add it to the list', async () => {
    await render([home]);

    type(newNameInput(), '  Trabajo ');
    await submit(control<HTMLFormElement>('Nueva categoría'));

    const req = httpTesting.expectOne('/api/categories');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Trabajo' });
    req.flush(work, { status: 201, statusText: 'Created' });
    await fixture.whenStable();

    expect(names()).toEqual(['Casa', 'Trabajo']);
    expect(newNameInput().value).toBe('');
    expect(messages.status()).toBe('Categoría creada.');
  });

  it('should not send a blank name', async () => {
    await render([home]);

    type(newNameInput(), '   ');
    await submit(control<HTMLFormElement>('Nueva categoría'));

    httpTesting.expectNone('/api/categories');
    expect(element.querySelector('#new-name-error')?.textContent).toContain('El nombre es obligatorio.');
  });

  it('should rename a category in line', async () => {
    await render([home, work]);

    control<HTMLButtonElement>('Editar: Casa')?.click();
    await fixture.whenStable();
    const input = element.querySelector<HTMLInputElement>('#edit-name-3') as HTMLInputElement;
    expect(input.value).toBe('Casa');

    type(input, 'Hogar');
    await submit(control<HTMLFormElement>('Renombrar: Casa'));

    const req = httpTesting.expectOne('/api/categories/3');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ name: 'Hogar' });
    req.flush({ id: 3, name: 'Hogar' });
    await fixture.whenStable();

    expect(names()).toEqual(['Hogar', 'Trabajo']);
    expect(element.querySelector('#edit-name-3')).toBeNull();
    expect(messages.status()).toBe('Categoría renombrada.');
  });

  it('should discard the change when renaming is cancelled', async () => {
    await render([home]);

    control<HTMLButtonElement>('Editar: Casa')?.click();
    await fixture.whenStable();
    type(element.querySelector<HTMLInputElement>('#edit-name-3') as HTMLInputElement, 'Hogar');
    Array.from(element.querySelectorAll<HTMLButtonElement>('.edit-form button'))
      .find((b) => b.textContent?.trim() === 'Cancelar')
      ?.click();
    await fixture.whenStable();

    httpTesting.expectNone('/api/categories/3');
    expect(names()).toEqual(['Casa']);
  });

  it('should remove the row when the category is deleted', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await render([home, work]);

    control<HTMLButtonElement>('Eliminar: Casa')?.click();
    const req = httpTesting.expectOne('/api/categories/3');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();

    expect(names()).toEqual(['Trabajo']);
    expect(messages.status()).toBe('Categoría eliminada.');
  });

  it('should keep the row and show the notice when the server answers 409', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await render([home]);

    control<HTMLButtonElement>('Eliminar: Casa')?.click();
    httpTesting
      .expectOne('/api/categories/3')
      .flush({ status: 409, detail: 'Category 3 has tasks.' }, { status: 409, statusText: 'Conflict' });
    await fixture.whenStable();

    expect(messages.error()).toBe('Esta categoría tiene tareas asociadas (también en la papelera) y no se puede eliminar');
    expect(names()).toEqual(['Casa']);
    expect(control<HTMLButtonElement>('Eliminar: Casa')?.disabled).toBe(false);
  });

  it('should show the error when the server answers 422', async () => {
    await render([home]);

    type(newNameInput(), ' casa ');
    await submit(control<HTMLFormElement>('Nueva categoría'));
    httpTesting.expectOne('/api/categories').flush(
      {
        status: 422,
        violations: [{ propertyPath: 'name', title: 'A category with this name already exists.' }],
      },
      { status: 422, statusText: 'Unprocessable Content' },
    );
    await fixture.whenStable();

    expect(messages.error()).toBe('Revisa los datos: A category with this name already exists.');
    expect(newNameInput().value).toBe(' casa ');
    expect(newNameInput().getAttribute('aria-invalid')).toBe('true');
    expect(element.querySelector('#new-name-error')).not.toBeNull();
    expect(names()).toEqual(['Casa']);
  });
});
