import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginPage } from './login-page';
import { LoginForm } from '../login-form/login-form';
import { AuthStore } from '../../data-access/auth.store';


describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let authStoreMock: {
    isLoading: ReturnType<typeof signal<boolean>>;
    error: ReturnType<typeof signal<string | null>>;
    login: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authStoreMock = {
      isLoading: signal(false),
      error: signal<string | null>(null),
      login: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideZonelessChangeDetection(), { provide: AuthStore, useValue: authStoreMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
  });

  it('delegates submitted credentials straight to AuthStore.login', () => {
    const credentials = { email: 'maria.alvarez@clouddesk.io', password: 'Password123!', rememberMe: false };

    fixture.componentInstance.handleSubmit(credentials);

    expect(authStoreMock.login).toHaveBeenCalledWith(credentials);
  });

  it('passes AuthStore.isLoading() through to the child LoginForm as an input', () => {
    authStoreMock.isLoading.set(true);
    fixture.detectChanges();

    const loginForm = fixture.debugElement.query(By.directive(LoginForm));
    expect(loginForm.componentInstance.isLoading()).toBe(true);
  });

  it('passes AuthStore.error() through to the child LoginForm as an input', () => {
    authStoreMock.error.set('Invalid email or password.');
    fixture.detectChanges();

    const loginForm = fixture.debugElement.query(By.directive(LoginForm));
    expect(loginForm.componentInstance.errorMessage()).toBe('Invalid email or password.');
  });
});