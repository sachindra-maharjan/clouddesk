import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../features/auth/data-access/auth.store';

/**
 * Protects routes that require a signed-in user. Reads the AuthStore
 * (already hydrated from a stored token, if any, via its onInit hook)
 * rather than re-checking localStorage directly, so there's one source
 * of truth for "am I logged in".
 */
export const authGuard: CanActivateFn = () => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    return authStore.isAuthenticated() ? true : router.createUrlTree(['/login']);
};
