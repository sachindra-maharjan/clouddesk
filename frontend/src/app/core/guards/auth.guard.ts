import { CanActivateFn } from '@angular/router';

/**
 * SCAFFOLD PLACEHOLDER.
 * The Auth feature (Phase 3) replaces this with a real guard that reads
 * the auth Signal Store and redirects unauthenticated users to /login.
 * Currently allows everything through so routing can be exercised before
 * auth exists.
 */
export const authGuard: CanActivateFn = () => true;
