// Task contract of the API: copies backend/src/Dto/TaskOutput.php,
// CompleteTaskOutput.php and TaskInput.php (docs/analisis.md §4).
export type Recurrence = 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string; // ISO 8601
  recurrence: Recurrence | null;
  nextOccurrenceDate: string | null; // YYYY-MM-DD
  templateId: number | null;
  deletedAt: string | null; // ISO 8601
}

export interface TaskInput {
  title: string;
  recurrence: Recurrence | null;
}

export interface CompleteTaskResult {
  task: Task;
  nextOccurrence: Task | null;
}
