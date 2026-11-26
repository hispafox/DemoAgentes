import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskApiService } from '../../../core/api/task-api.service';
import { MessageService } from '../../../core/messages/message.service';
import { Task } from '../../../core/models/task';

// F-13: list the tasks in the trash; F-14: restore a task (RN-10).
// Tasks in the trash cannot be edited or completed (RN-13), so the only action is "Restaurar".
@Component({
  selector: 'app-task-trash',
  imports: [RouterLink, DatePipe],
  templateUrl: './task-trash.html',
  styleUrl: './task-trash.css',
})
export class TaskTrash implements OnInit {
  private readonly api = inject(TaskApiService);
  private readonly messages = inject(MessageService);

  protected readonly tasks = signal<Task[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadFailed = signal(false);
  // Ids of the tasks being restored, to disable their buttons.
  protected readonly busy = signal<ReadonlySet<number>>(new Set());

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.api.trash().subscribe({
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

  restore(task: Task): void {
    this.setBusy(task.id, true);
    this.api.restore(task.id).subscribe({
      next: () => {
        this.tasks.update((tasks) => tasks.filter((t) => t.id !== task.id));
        this.messages.announce('Tarea restaurada.');
        this.setBusy(task.id, false);
      },
      error: (error: unknown) => {
        this.setBusy(task.id, false);
        // 409: the task is no longer in the trash (e.g. restored in another tab).
        // The interceptor already shows the message; reload to show the real state.
        if (error instanceof HttpErrorResponse && error.status === 409) {
          this.load();
        }
      },
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
