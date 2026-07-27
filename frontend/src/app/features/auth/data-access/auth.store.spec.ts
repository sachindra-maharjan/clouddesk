import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NEVER, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthStore } from './auth.store';
import { Auth } from './auth';
import { TokenStorage } from '../../../core/services/token-storage';


function fakeJwt(payload: object): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.fake-signature`;
}

describe('AuthStore', () => {
    let authServiceMock: { login: ReturnType<typeof vi.fn> };
    let tokenStorageMock: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn>; clear: ReturnType<typeof vi.fn> };
    let routerMock: { navigateByUrl: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        authServiceMock = { login: vi.fn() };
        tokenStorageMock = { get: vi.fn().mockReturnValue(null), set: vi.fn(), clear: vi.fn() };
        routerMock = { navigateByUrl: vi.fn() };

        TestBed.configureTestingModule({
            providers: [
                { provide: Auth, useValue: authServiceMock },
                { provide: TokenStorage, useValue: tokenStorageMock },
                { provide: Router, useValue: routerMock },
            ],
        });
    });

    it('starts unauthenticated with no user when there is no stored token', () => {
        const store = TestBed.inject(AuthStore);

        expect(store.isAuthenticated()).toBe(false);
        expect(store.user()).toBeNull();
    });

    it('on successful login: stores the token, sets user state, and navigates home', () => {
        authServiceMock.login.mockReturnValue(
            of({
                token: 'signed.jwt.token',
                user: { id: '1', email: 'maria.alvarez@clouddesk.io', displayName: 'Maria Alvarez', role: 'ADMIN' as const },
            })
        );
        const store = TestBed.inject(AuthStore);

        store.login({ email: 'maria.alvarez@clouddesk.io', password: 'Password123!', rememberMe: false });

        expect(tokenStorageMock.set).toHaveBeenCalledWith('signed.jwt.token');
        expect(store.isAuthenticated()).toBe(true);
        expect(store.user()?.displayName).toBe('Maria Alvarez');
        expect(store.isLoading()).toBe(false);
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/home');
    });

    it('on failed login: sets a generic error, does not navigate, and does not store a token', () => {
        authServiceMock.login.mockReturnValue(throwError(() => ({ status: 401 })));
        const store = TestBed.inject(AuthStore);

        store.login({ email: 'maria.alvarez@clouddesk.io', password: 'wrong-password', rememberMe: false });

        expect(store.error()).toBe('Invalid email or password.');
        expect(store.isAuthenticated()).toBe(false);
        expect(tokenStorageMock.set).not.toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
    });

    it('sets loading to true while a login request is in flight', () => {
        // NEVER is a real Observable that never emits or completes, so we can
        // inspect state mid-request without needing a fake HTTP response.
        authServiceMock.login.mockReturnValue(NEVER);
        const store = TestBed.inject(AuthStore);

        store.login({ email: 'maria.alvarez@clouddesk.io', password: 'Password123!', rememberMe: false });

        expect(store.isLoading()).toBe(true);
    });

    it('logout clears the token, resets state, and navigates to /login', () => {
        const store = TestBed.inject(AuthStore);

        store.logout();

        expect(tokenStorageMock.clear).toHaveBeenCalled();
        expect(store.isAuthenticated()).toBe(false);
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/login');
    });

    it('hydrates the session from a valid stored token on init (no HTTP call)', () => {
        const claims = {
            sub: 'maria.alvarez@clouddesk.io',
            userId: '1',
            displayName: 'Maria Alvarez',
            role: 'ADMIN',
            exp: Math.floor(Date.now() / 1000) + 3600,
        };
        tokenStorageMock.get.mockReturnValue(fakeJwt(claims));

        const store = TestBed.inject(AuthStore);

        expect(store.isAuthenticated()).toBe(true);
        expect(store.user()?.email).toBe('maria.alvarez@clouddesk.io');
        expect(authServiceMock.login).not.toHaveBeenCalled();
    });

    it('clears an expired stored token instead of hydrating', () => {
        const expiredClaims = {
            sub: 'maria.alvarez@clouddesk.io',
            userId: '1',
            displayName: 'Maria Alvarez',
            role: 'ADMIN',
            exp: Math.floor(Date.now() / 1000) - 3600,
        };
        tokenStorageMock.get.mockReturnValue(fakeJwt(expiredClaims));

        const store = TestBed.inject(AuthStore);

        expect(store.isAuthenticated()).toBe(false);
        expect(tokenStorageMock.clear).toHaveBeenCalled();
    });
});