import { Routes } from '@angular/router';

// Screens of docs/analisis.md §6: tasks (#10), trash (#11), templates (#12) and categories (#15).
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
  {
    path: 'templates',
    loadComponent: () =>
      import('./features/task-templates/template-list/template-list').then((m) => m.TemplateList),
  },
  {
    path: 'templates/new',
    loadComponent: () =>
      import('./features/task-templates/template-form/template-form').then((m) => m.TemplateForm),
  },
  {
    path: 'templates/:id/edit',
    loadComponent: () =>
      import('./features/task-templates/template-form/template-form').then((m) => m.TemplateForm),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./features/categories/category-list/category-list').then((m) => m.CategoryList),
  },
];
