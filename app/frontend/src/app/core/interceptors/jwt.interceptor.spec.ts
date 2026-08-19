import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { jwtInterceptor } from './jwt.interceptor';
import { TokenStorage } from '../services/token-storage';

describe('jwtInterceptor', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;
    let tokenStorageMock: { get: ReturnType<typeof vi.fn>; clear: ReturnType<typeof vi.fn> };
    let routerMock: { navigateByUrl: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        tokenStorageMock = { get: vi.fn(), clear: vi.fn() };
        routerMock = { navigateByUrl: vi.fn() };

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([jwtInterceptor])),
                provideHttpClientTesting(),
                { provide: TokenStorage, useValue: tokenStorageMock },
                { provide: Router, useValue: routerMock },
            ],
        });

        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('attaches the Authorization header when a token is stored', () => {
        tokenStorageMock.get.mockReturnValue('signed.jwt.token');

        http.get('/api/files').subscribe();

        const req = httpMock.expectOne('/api/files');
        expect(req.request.headers.get('Authorization')).toBe('Bearer signed.jwt.token');
        req.flush({});
    });

    it('does not attach a header when there is no stored token', () => {
        tokenStorageMock.get.mockReturnValue(null);

        http.get('/api/files').subscribe();

        const req = httpMock.expectOne('/api/files');
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush({});
    });

    it('never attaches a header to the login request itself', () => {
        tokenStorageMock.get.mockReturnValue('signed.jwt.token');

        http.post('/api/auth/login', {}).subscribe();

        const req = httpMock.expectOne('/api/auth/login');
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush({});
    });

    it('on a 401, clears the token and redirects to /login', () => {
        tokenStorageMock.get.mockReturnValue('expired.jwt.token');

        http.get('/api/files').subscribe({ error: () => { } });

        const req = httpMock.expectOne('/api/files');
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

        expect(tokenStorageMock.clear).toHaveBeenCalled();
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/login');
    });

    it('does not touch the token on non-401 errors', () => {
        tokenStorageMock.get.mockReturnValue('signed.jwt.token');

        http.get('/api/files').subscribe({ error: () => { } });

        const req = httpMock.expectOne('/api/files');
        req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

        expect(tokenStorageMock.clear).not.toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
    });
});