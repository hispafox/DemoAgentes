import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskTemplateApiService } from '../../../core/api/task-template-api.service';
import { MessageService } from '../../../core/messages/message.service';
import { Recurrence } from '../../../core/models/task';
import { TaskTemplateInput } from '../../../core/models/task-template';

// A title made only of spaces counts as empty, like NotBlank in the backend (RN-07).
function notBlank(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim() === '' ? { required: true } : null;
}

// F-08: see a template (loaded when editing); F-09: create a template; F-10: edit it.
// The mode depends on the :id route parameter.
@Component({
  selector: 'app-template-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './template-form.html',
  styleUrl: './template-form.css',
})
export class TemplateForm implements OnInit {
  private readonly api = inject(TaskTemplateApiService);
  private readonly messages = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly titleInput = viewChild<ElementRef<HTMLInputElement>>('titleInput');

  protected readonly id: number | null = this.route.snapshot.paramMap.has('id')
    ? Number(this.route.snapshot.paramMap.get('id'))
    : null;

  protected readonly loading = signal(false);
  protected readonly notFound = signal(false);
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);

  // RN-07: title required, at most 255 characters; recurrence null or one of the enum values.
  protected readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, notBlank, Validators.maxLength(255)] }),
    recurring: new FormControl(false, { nonNullable: true }),
    recurrence: new FormControl<Recurrence>('weekly', { nonNullable: true }),
  });

  ngOnInit(): void {
    if (this.id === null) {
      return;
    }
    this.loading.set(true);
    this.api.get(this.id).subscribe({
      next: (template) => {
        this.form.setValue({
          title: template.title,
          recurring: template.recurrence !== null,
          recurrence: template.recurrence ?? 'weekly',
        });
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.notFound.set(error instanceof HttpErrorResponse && error.status === 404);
        this.loading.set(false);
      },
    });
  }

  protected get titleInvalid(): boolean {
    const title = this.form.controls.title;
    return title.invalid && (title.touched || this.submitted());
  }

  protected get titleError(): string {
    return this.form.controls.title.hasError('maxlength')
      ? 'El título no puede superar los 255 caracteres.'
      : 'El título es obligatorio.';
  }

  save(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.titleInput()?.nativeElement.focus();
      return;
    }

    const { title, recurring, recurrence } = this.form.getRawValue();
    const input: TaskTemplateInput = { title: title.trim(), recurrence: recurring ? recurrence : null };
    const request = this.id === null ? this.api.create(input) : this.api.update(this.id, input);

    this.saving.set(true);
    this.messages.clear();
    request.subscribe({
      next: () => {
        this.messages.announce(this.id === null ? 'Plantilla creada.' : 'Plantilla guardada.');
        void this.router.navigate(['/templates']);
      },
      // The interceptor already shows the API message; the form keeps what was typed.
      error: () => this.saving.set(false),
    });
  }
}
