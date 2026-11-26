import { Injectable, signal } from '@angular/core';

// Messages for the user, displayed by the root component (docs/analisis.md §6):
// - error: last API error, written by the interceptor and shown as an alert.
// - status: result of the last action ("Tarea completada."), announced politely.
@Injectable({ providedIn: 'root' })
export class MessageService {
  readonly error = signal<string | null>(null);
  readonly status = signal<string | null>(null);

  showError(message: string): void {
    this.error.set(message);
  }

  announce(message: string): void {
    this.status.set(message);
  }

  clear(): void {
    this.error.set(null);
  }
}
