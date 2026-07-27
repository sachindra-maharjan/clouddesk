import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { Auth } from './auth';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment.development';

describe('Auth', () => {
  let authService: Auth;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    authService = TestBed.inject(Auth);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that mock http was used to make the request
    httpMock.verify();
  })

  it("POSTs email and password to /auth/login", () => {
    authService
      .login({ email: 'maria.alverez@clouddesk.io', password: 'password123!', rememberMe: true })
      .subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'maria.alverez@clouddesk.io',
      password: 'password123!'
    })

    req.flush({
      token: 'signed.jwt.token',
      user: { id: '1', email: 'maria.alverez@clouddesk.io', displayName: 'Maria Alverez', role: 'ADMIN' }
    });
  })


});
