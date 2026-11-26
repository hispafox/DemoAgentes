import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskApiService } from '../../../core/api/task-api.service';
import { MessageService } from '../../../core/messages/message.service';
import { Task } from '../../../core/models/task';
import { RecurrenceLabelPipe } from '../../../shared/recurrence-label.pipe';

type RowAction = 'complete' | 'delete';

// F-01: list tasks (pending and completed). F-05: move a task to the trash.
// F-06: complete a task; the next occurrence comes from the API (RN-05, RN-06).
@Component({
  imports: [RouterLink, DatePipe, RecurrenceLabelPipe],
  selector: 'app-task-list',
  styleUrl: './task-list.css',
  templateUrl: './task-list.html',
})
export class TaskList implements OnInit {
  private readonly api = inject(TaskApiService);
  private readonly messages = inject(MessageService);

  protected readonly tasks = signal<Task[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadFailed = signal(false);
  private readonly busy = signal<ReadonlySet<string>>(new Set());

  protected readonly pending = computed(() => this.tasks().filter((t) => !t.completed));
  protected readonly done = computed(() => this.tasks().filter((t) => t.completed));

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.api.list().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: () => {
        this.loadFailed.set(true);
        this.loading.set(false);
      },
    });
  }

  protected isBusy(task: Task, action: RowAction): boolean {
    return this.busy().has(`${task.id}:${action}`);
  }

  // RN-11: only pending tasks can be completed (the button is not shown otherwise).
  protected complete(task: Task): void {
    this.setBusy(task, 'complete', true);
    this.api.complete(task.id).subscribe({
      next: ({ task: completed, nextOccurrence }) => {
        this.tasks.update((list) => {
          const updated = list.map((t) => (t.id === completed.id ? completed : t));
          return nextOccurrence ? [...updated, nextOccurrence] : updated;
        });
        this.messages.announce(
          nextOccurrence ? 'Tarea completada. Se ha creado la siguiente repetición.' : 'Tarea completada.',
        );
        this.setBusy(task, 'complete', false);
      },
      error: () => this.setBusy(task, 'complete', false),
    });
  }

  // RN-10: deleting moves the task to the trash, so it can be restored.
  protected remove(task: Task): void {
    if (!confirm(`¿Mover «${task.title}» a la papelera? Podrás restaurarla desde la papelera.`)) {
      return;
    }
    this.setBusy(task, 'delete', true);
    this.api.delete(task.id).subscribe({
      next: () => {
        this.tasks.update((list) => list.filter((t) => t.id !== task.id));
        this.messages.announce('Tarea movida a la papelera.');
        this.setBusy(task, 'delete', false);
      },
      error: () => this.setBusy(task, 'delete', false),
    });
  }

  private setBusy(task: Task, action: RowAction, value: boolean): void {
    const key = `${task.id}:${action}`;
    this.busy.update((current) => {
      const next = new Set(current);
      if (value) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  }
}
