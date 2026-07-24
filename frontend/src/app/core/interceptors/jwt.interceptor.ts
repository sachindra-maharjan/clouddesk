import { HttpInterceptorFn } from '@angular/common/http';

/**
 * SCAFFOLD PLACEHOLDER.
 * The Auth feature (Phase 3) replaces this no-op with a real interceptor,
 * built test-first against HttpTestingController:
 *   - attaches `Authorization: Bearer <token>` from the auth signal store
 *   - skips attaching a token for the /auth/login request itself
 *   - on 401, clears the session and redirects to /login
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => next(req);
