import { Routes } from '@angular/router';

/**
 * SCAFFOLD PLACEHOLDER.
 * Each feature below is added one at a time in Phase 3, in priority order:
 *   1. auth        -> loadChildren: () => import('./features/auth/auth.routes')
 *   2. files        -> loadChildren: () => import('./features/files/files.routes')
 *   3. dashboard    -> loadChildren: () => import('./features/dashboard/dashboard.routes')
 *   4. ai-reports   -> loadChildren: () => import('./features/ai-reports/ai-reports.routes')
 *   5. profile / settings
 *
 * Until then, the app just proves the shell renders and routing infra works.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shared/layout/scaffold-home/scaffold-home').then((m) => m.ScaffoldHome),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/layout/not-found/not-found').then((m) => m.NotFound),
  },
];
