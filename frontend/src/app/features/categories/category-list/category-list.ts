import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CategoryApiService } from '../../../core/api/category-api.service';
import { MessageService } from '../../../core/messages/message.service';
import { Category } from '../../../core/models/category';

// A name made only of spaces counts as empty, like NotBlank in the backend (RN-14).
function notBlank(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim() === '' ? { required: true } : null;
}

// RN-14: name required, at most 100 characters (CategoryInput in the backend).
function nameControl(): FormControl<string> {
  return new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, notBlank, Validators.maxLength(100)],
  });
}

// F-15: list categories; F-16: create; F-17: rename in line; F-18: delete (RN-16).
// Unique names (RN-17) are checked by the API, which answers 422; the interceptor shows its message.
@Component({
  selector: 'app-category-list',
  imports: [ReactiveFormsModule],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
})
export class CategoryList implements OnInit {
  private readonly api = inject(CategoryApiService);
  private readonly messages = inject(MessageService);
  private readonly newNameInput = viewChild<ElementRef<HTMLInputElement>>('newNameInput');
  private readonly editNameInput = viewChild<ElementRef<HTMLInputElement>>('editNameInput');

  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadFailed = signal(false);
  // Ids of the categories with an action in progress, to disable their buttons.
  protected readonly busy = signal<ReadonlySet<number>>(new Set());

  // Create form.
  protected readonly createForm = new FormGroup({ name: nameControl() });
  protected readonly newName = this.createForm.controls.name;
  protected readonly creating = signal(false);
  protected readonly createSubmitted = signal(false);
  protected readonly createRejected = signal(false);

  // Rename in line: id of the category being edited and its field (saved only with "Guardar").
  protected readonly editingId = signal<number | null>(null);
  protected readonly editForm = new FormGroup({ name: nameControl() });
  protected readonly editName = this.editForm.controls.name;
  protected readonly editSubmitted = signal(false);
  protected readonly editRejected = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.api.list().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: () => {
        this.loadFailed.set(true);
        this.loading.set(false);
      },
    });
  }

  protected get newNameInvalid(): boolean {
    return (this.newName.invalid && this.createSubmitted()) || this.createRejected();
  }

  protected get editNameInvalid(): boolean {
    return (this.editName.invalid && this.editSubmitted()) || this.editRejected();
  }

  protected nameError(control: FormControl<string>): string {
    if (control.hasError('maxlength')) {
      return 'El nombre no puede superar los 100 caracteres.';
    }
    if (control.invalid) {
      return 'El nombre es obligatorio.';
    }
    // The API rejected a valid-looking name (422): usually a repeated name (RN-17).
    return 'Revisa el nombre: puede que ya exista una categoría con ese nombre.';
  }

  create(): void {
    this.createSubmitted.set(true);
    this.createRejected.set(false);
    if (this.newName.invalid) {
      this.newNameInput()?.nativeElement.focus();
      return;
    }
    this.creating.set(true);
    this.messages.clear();
    this.api.create({ name: this.newName.value.trim() }).subscribe({
      next: (category) => {
        this.categories.update((categories) => [...categories, category]);
        this.messages.announce('Categoría creada.');
        this.newName.reset('');
        this.createSubmitted.set(false);
        this.creating.set(false);
      },
      error: (error: unknown) => {
        // 422: the interceptor shows the API message; the field keeps what was typed.
        this.createRejected.set(isValidationError(error));
        this.creating.set(false);
      },
    });
  }

  startEdit(category: Category): void {
    this.editingId.set(category.id);
    this.editName.reset(category.name);
    this.editSubmitted.set(false);
    this.editRejected.set(false);
    // Move the focus to the field once it is rendered.
    setTimeout(() => this.editNameInput()?.nativeElement.focus());
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  rename(category: Category): void {
    this.editSubmitted.set(true);
    this.editRejected.set(false);
    if (this.editName.invalid) {
      this.editNameInput()?.nativeElement.focus();
      return;
    }
    this.setBusy(category.id, true);
    this.messages.clear();
    this.api.update(category.id, { name: this.editName.value.trim() }).subscribe({
      next: (renamed) => {
        this.categories.update((categories) => categories.map((c) => (c.id === renamed.id ? renamed : c)));
        this.messages.announce('Categoría renombrada.');
        this.editingId.set(null);
        this.setBusy(category.id, false);
      },
      error: (error: unknown) => {
        this.editRejected.set(isValidationError(error));
        this.setBusy(category.id, false);
      },
    });
  }

  remove(category: Category): void {
    if (!confirm(`¿Eliminar la categoría «${category.name}»? Esta acción no se puede deshacer.`)) {
      return;
    }
    this.setBusy(category.id, true);
    this.api.delete(category.id).subscribe({
      next: () => {
        this.categories.update((categories) => categories.filter((c) => c.id !== category.id));
        this.messages.announce('Categoría eliminada.');
        this.setBusy(category.id, false);
      },
      error: (error: unknown) => {
        // RN-16: the API refuses with 409 when the category has tasks (also in the trash).
        if (error instanceof HttpErrorResponse && error.status === 409) {
          this.messages.showError('Esta categoría tiene tareas asociadas (también en la papelera) y no se puede eliminar');
        }
        this.setBusy(category.id, false);
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

function isValidationError(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 422;
}
