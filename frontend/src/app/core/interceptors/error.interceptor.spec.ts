import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessageService } from '../messages/message.service';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let messages: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([errorInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    messages = TestBed.inject(MessageService);
  });

  afterEach(() => httpTesting.verify());

  function failWith(status: number, body: string | object): unknown {
    let received: unknown;
    http.get('/api/tasks/1').subscribe({ error: (e: unknown) => (received = e) });
    httpTesting.expectOne('/api/tasks/1').flush(body, { status, statusText: 'Error' });
    return received;
  }

  it('should show the violations of a 422', () => {
    failWith(422, {
      status: 422,
      violations: [{ propertyPath: 'title', title: 'This value should not be blank.' }],
    });

    expect(messages.error()).toBe('Revisa los datos: This value should not be blank.');
  });

  it('should show the detail of a 409', () => {
    failWith(409, { status: 409, detail: 'RN-12: a template with tasks cannot be deleted.' });

    expect(messages.error()).toBe(
      'La acción no está permitida en el estado actual. (RN-12: a template with tasks cannot be deleted.)',
    );
  });

  it('should show a not found message for a 404', () => {
    failWith(404, { status: 404, detail: 'Task 1 not found.' });

    expect(messages.error()).toBe('No se ha encontrado el elemento.');
  });

  it('should show a generic message for other errors', () => {
    failWith(500, 'Internal Server Error');

    expect(messages.error()).toBe('Ha ocurrido un error inesperado.');
  });

  it('should rethrow the error to the caller', () => {
    expect(failWith(404, { status: 404 })).toBeTruthy();
  });
});
