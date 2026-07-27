import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { authGuard } from './auth.guard';
import { AuthStore } from '../../features/auth/data-access/auth.store'

describe('authGuard', () => {
    let authStoreMock: { isAuthenticated: ReturnType<typeof vi.fn> };
    let routerMock: { createUrlTree: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        authStoreMock = { isAuthenticated: vi.fn() };
        routerMock = { createUrlTree: vi.fn().mockReturnValue({} as UrlTree) };

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthStore, useValue: authStoreMock },
                { provide: Router, useValue: routerMock },
            ],
        });
    });

    it('allows navigation when the user is authenticated', () => {
        authStoreMock.isAuthenticated.mockReturnValue(true);

        const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

        expect(result).toBe(true);
    });

    it('redirects to /login when the user is not authenticated', () => {
        authStoreMock.isAuthenticated.mockReturnValue(false);

        TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

        expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
    });
});