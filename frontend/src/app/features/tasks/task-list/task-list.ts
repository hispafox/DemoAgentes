import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskApiService } from '../../../core/api/task-api.service';
import { MessageService } from '../../../core/messages/message.service';
import { Task } from '../../../core/models/task';
import { RecurrenceLabelPipe } from '../../../shared/recurrence-label.pipe';

// F-01: list pending and completed tasks; F-05: move a task to the trash; F-06: complete a task.
@Component({
  selector: 'app-task-list',
  imports: [RouterLink, DatePipe, RecurrenceLabelPipe],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnInit {
  private readonly api = inject(TaskApiService);
  private readonly messages = inject(MessageService);

  protected readonly tasks = signal<Task[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadFailed = signal(false);
  // Ids of the tasks with an action in progress, to disable their buttons.
  protected readonly busy = signal<ReadonlySet<number>>(new Set());

  protected readonly pending = computed(() => this.tasks().filter((t) => !t.completed));
  protected readonly completed = computed(() => this.tasks().filter((t) => t.completed));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
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

  complete(task: Task): void {
    this.setBusy(task.id, true);
    this.api.complete(task.id).subscribe({
      next: ({ task: done, nextOccurrence }) => {
        // The next occurrence comes from the API (RN-05); the frontend never computes it.
        this.tasks.update((tasks) => [
          ...tasks.map((t) => (t.id === done.id ? done : t)),
          ...(nextOccurrence ? [nextOccurrence] : []),
        ]);
        this.messages.announce(
          nextOccurrence ? 'Tarea completada. Se ha creado la siguiente repetición.' : 'Tarea completada.',
        );
        this.setBusy(task.id, false);
      },
      error: () => this.setBusy(task.id, false),
    });
  }

  remove(task: Task): void {
    if (!confirm(`¿Mover «${task.title}» a la papelera? Podrás restaurarla desde la papelera.`)) {
      return;
    }
    this.setBusy(task.id, true);
    this.api.delete(task.id).subscribe({
      next: () => {
        this.tasks.update((tasks) => tasks.filter((t) => t.id !== task.id));
        this.messages.announce('Tarea movida a la papelera.');
        this.setBusy(task.id, false);
      },
      error: () => this.setBusy(task.id, false),
    });
  }

  protected isBusy(id: number): boolean {
    return this.busy().has(id);
  }

  private setBusy(id: number, value: boolean): void {
    this.busy.update((current) => {
      const next = new Set(current);
      if (value) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }
}
