import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { errorInterceptor } from '../../../core/interceptors/error.interceptor';
import { MessageService } from '../../../core/messages/message.service';
import { TaskTemplate } from '../../../core/models/task-template';
import { TemplateForm } from './template-form';

// Issue #12: acceptance criteria of the template form. The API is replaced by HttpTestingController.
describe('TemplateForm', () => {
  let fixture: ComponentFixture<TemplateForm>;
  let element: HTMLElement;
  let httpTesting: HttpTestingController;
  let messages: MessageService;
  let navigate: ReturnType<typeof vi.spyOn>;

  const mail: TaskTemplate = { id: 4, title: 'Revisar el correo', recurrence: 'monthly' };

  async function render(id: string | null): Promise<void> {
    TestBed.configureTestingModule({
      imports: [TemplateForm],
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

    fixture = TestBed.createComponent(TemplateForm);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
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

  it('should show the title error and not call the API when saving with an empty title', async () => {
    await render(null);

    await submit();

    httpTesting.expectNone('/api/task-templates');
    expect(element.querySelector('#title-error')?.textContent).toContain('Error: El título es obligatorio.');
    expect(input<HTMLInputElement>('#title').getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement).toBe(input('#title'));
  });

  it('should treat a title with only spaces as empty', async () => {
    await render(null);

    type('   ');
    await submit();

    httpTesting.expectNone('/api/task-templates');
    expect(element.querySelector('#title-error')).not.toBeNull();
  });

  it('should create the template and go back to /templates when the form is valid', async () => {
    await render(null);

    type('Revisar el correo');
    input<HTMLInputElement>('input[type="checkbox"]').click();
    await fixture.whenStable();
    const select = input<HTMLSelectElement>('#recurrence');
    select.value = 'daily';
    select.dispatchEvent(new Event('change'));
    await submit();

    const req = httpTesting.expectOne('/api/task-templates');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'Revisar el correo', recurrence: 'daily' });
    req.flush({ ...mail, recurrence: 'daily' }, { status: 201, statusText: 'Created' });
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith(['/templates']);
    expect(messages.status()).toBe('Plantilla creada.');
  });

  it('should load the template and send PUT when editing', async () => {
    await render('4');
    httpTesting.expectOne('/api/task-templates/4').flush(mail);
    await fixture.whenStable();

    expect(element.querySelector('h2')?.textContent).toContain('Editar plantilla');
    expect(input<HTMLInputElement>('#title').value).toBe('Revisar el correo');
    expect(input<HTMLSelectElement>('#recurrence').value).toBe('monthly');

    input<HTMLInputElement>('input[type="checkbox"]').click();
    await fixture.whenStable();
    await submit();

    const req = httpTesting.expectOne('/api/task-templates/4');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ title: 'Revisar el correo', recurrence: null });
    req.flush({ ...mail, recurrence: null });
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith(['/templates']);
    expect(messages.status()).toBe('Plantilla guardada.');
  });

  it('should show a not found message when the template does not exist', async () => {
    await render('99');
    httpTesting.expectOne('/api/task-templates/99').flush({ status: 404 }, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();

    expect(element.textContent).toContain('No se ha encontrado la plantilla.');
    expect(element.querySelector('form')).toBeNull();
  });

  it('should show the API message and stay on the form when saving fails', async () => {
    await render(null);

    type('Revisar el correo');
    await submit();
    httpTesting.expectOne('/api/task-templates').flush(
      { status: 422, violations: [{ propertyPath: 'title', title: 'This value is too long.' }] },
      { status: 422, statusText: 'Unprocessable Content' },
    );
    await fixture.whenStable();

    expect(messages.error()).toBe('Revisa los datos: This value is too long.');
    expect(navigate).not.toHaveBeenCalled();
    expect(input<HTMLButtonElement>('button[type="submit"]').disabled).toBe(false);
  });
});
