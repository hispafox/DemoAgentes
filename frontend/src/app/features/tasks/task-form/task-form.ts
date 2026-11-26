import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { TaskApiService } from '../../../core/api/task-api.service';
import { MessageService } from '../../../core/messages/message.service';
import { Recurrence, Task, TaskInput } from '../../../core/models/task';

const TITLE_MAX_LENGTH = 255; // Same limit as the backend (RN-01)

// RN-01: a title made only of spaces counts as empty (NotBlank with trim in the backend).
const notBlank: ValidatorFn = (control: AbstractControl<string>): ValidationErrors | null =>
  control.value.trim() === '' ? { required: true } : null;

// RN-03: a recurring task must have a recurrence.
const recurrenceRequired: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const { recurring, recurrence } = (group as TaskFormGroup).controls;
  return recurring.value && !recurrence.value ? { recurrenceRequired: true } : null;
};

type TaskFormGroup = FormGroup<{
  title: FormControl<string>;
  recurring: FormControl<boolean>;
  recurrence: FormControl<Recurrence | null>;
}>;

// F-03: create a task. F-04: edit its title or recurrence (RN-03, RN-04).
// The mode depends on the :id route parameter.
@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-task-form',
  styleUrl: './task-form.css',
  templateUrl: './task-form.html',
})
export class TaskForm implements OnInit {
  private readonly api = inject(TaskApiService);
  private readonly messages = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly titleInput = viewChild<ElementRef<HTMLInputElement>>('titleInput');

  protected readonly titleMaxLength = TITLE_MAX_LENGTH;
  protected readonly taskId = this.readId();
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);

  protected readonly form: TaskFormGroup = new FormGroup(
    {
      title: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, notBlank, Validators.maxLength(TITLE_MAX_LENGTH)],
      }),
      recurring: new FormControl(false, { nonNullable: true }),
      recurrence: new FormControl<Recurrence | null>(null),
    },
    { validators: recurrenceRequired },
  );

  ngOnInit(): void {
    // Checking "recurring" preselects "weekly"; unchecking clears the recurrence.
    this.form.controls.recurring.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((recurring) => {
      const recurrence = this.form.controls.recurrence;
      if (recurring && !recurrence.value) {
        recurrence.setValue('weekly');
      } else if (!recurring) {
        recurrence.setValue(null);
      }
    });

    if (this.taskId !== null) {
      this.load(this.taskId);
    }
  }

  protected get titleInvalid(): boolean {
    const title = this.form.controls.title;
    return title.invalid && (title.touched || this.submitted());
  }

  protected get titleError(): string {
    return this.form.controls.title.hasError('maxlength')
      ? `El título no puede superar los ${TITLE_MAX_LENGTH} caracteres.`
      : 'El título es obligatorio.';
  }

  protected save(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.controls.title.invalid) {
        this.titleInput()?.nativeElement.focus();
      }
      return;
    }

    const { title, recurring, recurrence } = this.form.getRawValue();
    const input: TaskInput = { title: title.trim(), recurrence: recurring ? recurrence : null };
    const request: Observable<Task> =
      this.taskId === null ? this.api.create(input) : this.api.update(this.taskId, input);

    this.saving.set(true);
    request.subscribe({
      next: () => {
        this.messages.announce(this.taskId === null ? 'Tarea creada.' : 'Tarea guardada.');
        void this.router.navigate(['/tasks']);
      },
      // The interceptor shows the API message; the form keeps what was typed.
      error: () => this.saving.set(false),
    });
  }

  private load(id: number): void {
    this.loading.set(true);
    this.api.get(id).subscribe({
      next: (task) => {
        this.form.setValue({ title: task.title, recurring: task.recurrence !== null, recurrence: task.recurrence });
        this.loading.set(false);
      },
      error: (error: unknown) => {
        const notFound = error instanceof HttpErrorResponse && error.status === 404;
        this.loadError.set(notFound ? 'No se ha encontrado la tarea.' : 'No se ha podido cargar la tarea.');
        this.loading.set(false);
      },
    });
  }

  private readId(): number | null {
    const id = this.route.snapshot.paramMap.get('id');
    return id === null ? null : Number(id);
  }
}
