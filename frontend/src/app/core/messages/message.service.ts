import { Injectable, signal } from '@angular/core';

// Last error message to show to the user. The interceptor writes it and the
// root component displays it (docs/analisis.md §6).
@Injectable({ providedIn: 'root' })
export class MessageService {
  readonly error = signal<string | null>(null);

  showError(message: string): void {
    this.error.set(message);
  }

  clear(): void {
    this.error.set(null);
  }
}
