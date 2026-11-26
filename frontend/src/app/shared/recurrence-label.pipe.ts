import { Pipe, PipeTransform } from '@angular/core';
import { Recurrence } from '../core/models/task';

const LABELS: Record<Recurrence, string> = {
  daily: 'Diaria',
  weekly: 'Semanal',
  monthly: 'Mensual',
};

// RN-04: shows the recurrence in Spanish (daily → "Diaria"); empty if not recurring.
@Pipe({ name: 'recurrenceLabel' })
export class RecurrenceLabelPipe implements PipeTransform {
  transform(value: Recurrence | null): string {
    return value ? LABELS[value] : '';
  }
}
