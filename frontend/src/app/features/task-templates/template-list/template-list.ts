import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TaskTemplateApiService } from '../../../core/api/task-template-api.service';
import { MessageService } from '../../../core/messages/message.service';
import { TaskTemplate } from '../../../core/models/task-template';
import { RecurrenceLabelPipe } from '../../../shared/recurrence-label.pipe';

// F-07: list templates; F-11: delete a template (RN-12); F-12: create a task from a template (RN-08).
@Component({
  selector: 'app-template-list',
  imports: [RouterLink, RecurrenceLabelPipe],
  templateUrl: './template-list.html',
  styleUrl: './template-list.css',
})
export class TemplateList implements OnInit {
  private readonly api = inject(TaskTemplateApiService);
  private readonly messages = inject(MessageService);
  private readonly router = inject(Router);

  protected readonly templates = signal<TaskTemplate[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadFailed = signal(false);
  // Ids of the templates with an action in progress, to disable their buttons.
  protected readonly busy = signal<ReadonlySet<number>>(new Set());

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.api.list().subscribe({
      next: (templates) => {
        this.templates.set(templates);
        this.loading.set(false);
      },
      error: () => {
        this.loadFailed.set(true);
        this.loading.set(false);
      },
    });
  }

  createTask(template: TaskTemplate): void {
    this.setBusy(template.id, true);
    this.api.instantiate(template.id).subscribe({
      next: () => {
        this.messages.announce('Tarea creada.');
        void this.router.navigate(['/tasks']);
      },
      error: () => this.setBusy(template.id, false),
    });
  }

  remove(template: TaskTemplate): void {
    if (!confirm(`¿Eliminar la plantilla «${template.title}»? Esta acción no se puede deshacer.`)) {
      return;
    }
    this.setBusy(template.id, true);
    this.api.delete(template.id).subscribe({
      next: () => {
        this.templates.update((templates) => templates.filter((t) => t.id !== template.id));
        this.messages.announce('Plantilla eliminada.');
        this.setBusy(template.id, false);
      },
      error: (error: unknown) => {
        // RN-12: the API refuses with 409 when the template has tasks; this screen explains why.
        if (error instanceof HttpErrorResponse && error.status === 409) {
          this.messages.showError('Esta plantilla tiene tareas asociadas y no se puede eliminar');
        }
        this.setBusy(template.id, false);
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
