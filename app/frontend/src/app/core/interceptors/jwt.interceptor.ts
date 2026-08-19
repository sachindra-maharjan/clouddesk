import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorage } from '../services/token-storage';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Attaches `Authorization: Bearer <token>` to every outgoing request except
 * the login call itself. On a 401 from the backend, clears the stored
 * token and redirects to /login — the single place session expiry is
 * handled, so individual features never need to think about it.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const tokenStorage = inject(TokenStorage);
    const router = inject(Router);

    const isLoginRequest = req.url.endsWith("/auth/login");
    const token = tokenStorage.get();

    const authorizeRequest = token && !isLoginRequest ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

    return next(authorizeRequest).pipe(
        catchError((error) => {
            if (error?.status === 401 && !isLoginRequest) {
                tokenStorage.clear();
                router.navigateByUrl("/login");
            }

            return throwError(() => error);
        })
    );
};
