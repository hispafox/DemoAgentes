import { Routes } from '@angular/router';

// Screens of docs/analisis.md §6. Trash (#11) and templates (#12) arrive with their issues.
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tasks' },
  {
    path: 'tasks',
    title: 'Tareas',
    loadComponent: () => import('./features/tasks/task-list/task-list').then((m) => m.TaskList),
  },
  {
    path: 'tasks/new',
    title: 'Nueva tarea',
    loadComponent: () => import('./features/tasks/task-form/task-form').then((m) => m.TaskForm),
  },
  {
    path: 'tasks/:id/edit',
    title: 'Editar tarea',
    loadComponent: () => import('./features/tasks/task-form/task-form').then((m) => m.TaskForm),
  },
];
