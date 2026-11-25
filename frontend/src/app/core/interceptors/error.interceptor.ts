import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MessageService } from '../messages/message.service';
import { ProblemDetails } from '../models/problem-details';

// Turns API errors (application/problem+json) into a message in Spanish and
// rethrows them so the screen can react too (docs/analisis.md §4 and §6).
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messages = inject(MessageService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        messages.showError(errorMessage(error));
      }
      return throwError(() => error);
    }),
  );
};

export function errorMessage(error: HttpErrorResponse): string {
  const problem = isProblem(error.error) ? error.error : null;

  switch (error.status) {
    case 0:
      return 'No se puede conectar con el servidor.';
    case 404:
      return 'No se ha encontrado el elemento.';
    case 409:
      return 'La acción no está permitida en el estado actual.' + detail(problem);
    case 422: {
      const titles = problem?.violations?.map((v) => v.title) ?? [];
      return titles.length > 0 ? 'Revisa los datos: ' + titles.join(' ') : 'Revisa los datos del formulario.';
    }
    default:
      return 'Ha ocurrido un error inesperado.';
  }
}

function detail(problem: ProblemDetails | null): string {
  return problem?.detail ? ` (${problem.detail})` : '';
}

function isProblem(body: unknown): body is ProblemDetails {
  return typeof body === 'object' && body !== null && 'status' in body;
}
