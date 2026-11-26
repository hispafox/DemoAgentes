import { Routes } from '@angular/router';

// Screens of docs/analisis.md §6. Templates (#12) arrive with their issue.
// 'tasks/trash' is a static path, so it never clashes with 'tasks/:id/edit'.
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tasks' },
  {
    path: 'tasks',
    loadComponent: () => import('./features/tasks/task-list/task-list').then((m) => m.TaskList),
  },
  {
    path: 'tasks/new',
    loadComponent: () => import('./features/tasks/task-form/task-form').then((m) => m.TaskForm),
  },
  {
    path: 'tasks/trash',
    loadComponent: () => import('./features/tasks/task-trash/task-trash').then((m) => m.TaskTrash),
  },
  {
    path: 'tasks/:id/edit',
    loadComponent: () => import('./features/tasks/task-form/task-form').then((m) => m.TaskForm),
  },
];
