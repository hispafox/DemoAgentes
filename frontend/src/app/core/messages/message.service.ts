import { Injectable, signal } from '@angular/core';

// Messages for the user (docs/analisis.md §6):
// - error: last API error; the interceptor writes it and the root component shows it.
// - status: result of an action ("Tarea completada."), read by screen readers
//   from a role="status" region (docs/diseno/pantallas-tareas.md §6).
@Injectable({ providedIn: 'root' })
export class MessageService {
  readonly error = signal<string | null>(null);
  readonly status = signal<string>('');

  showError(message: string): void {
    this.error.set(message);
  }

  clear(): void {
    this.error.set(null);
  }

  announce(message: string): void {
    this.status.set(message);
  }
}
