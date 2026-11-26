import { Recurrence } from './task';

// Task template as the API returns and accepts it (backend/src/Dto/TaskTemplate*.php, docs/analisis.md §4).
export interface TaskTemplate {
  id: number;
  title: string;
  recurrence: Recurrence | null;
}

export interface TaskTemplateInput {
  title: string;
  recurrence: Recurrence | null;
}
