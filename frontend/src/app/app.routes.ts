import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

/**
 * Each feature below is added one at a time in Phase 3, in priority order:
 *   1. auth        -> loadChildren: () => import('./features/auth/auth.routes')
 *   2. files        -> loadChildren: () => import('./features/files/files.routes')
 *   3. dashboard    -> loadChildren: () => import('./features/dashboard/dashboard.routes')
 *   4. ai-reports   -> loadChildren: () => import('./features/ai-reports/ai-reports.routes')
 *   5. profile / settings
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/login'
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layout/home/home').then((m) => m.Home)
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/layout/not-found/not-found').then((m) => m.NotFound),
  },
];
