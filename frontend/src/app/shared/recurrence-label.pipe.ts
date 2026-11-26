import { Pipe, PipeTransform } from '@angular/core';
import { Recurrence } from '../core/models/task';

const LABELS: Record<Recurrence, string> = {
  daily: 'Diaria',
  weekly: 'Semanal',
  monthly: 'Mensual',
};

// RN-04: shows the recurrence of a task in Spanish; empty if it is not recurring.
@Pipe({ name: 'recurrenceLabel' })
export class RecurrenceLabelPipe implements PipeTransform {
  transform(recurrence: Recurrence | null | undefined): string {
    return recurrence ? LABELS[recurrence] : '';
  }
}
