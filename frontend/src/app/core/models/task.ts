// Task as the API returns and accepts it (backend/src/Dto, docs/analisis.md §4).
export type Recurrence = 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string; // ISO 8601
  recurrence: Recurrence | null;
  nextOccurrenceDate: string | null; // YYYY-MM-DD
  templateId: number | null;
  deletedAt: string | null;
}

export interface TaskInput {
  title: string;
  recurrence: Recurrence | null;
}

// Response of POST /api/tasks/{id}/complete.
export interface CompleteTaskResult {
  task: Task;
  nextOccurrence: Task | null;
}
