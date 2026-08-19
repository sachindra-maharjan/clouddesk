import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginForm } from './login-form';

describe('LoginForm', () => {
  let fixture: ComponentFixture<LoginForm>;
  let component: LoginForm;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginForm],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('starts invalid, so canSubmit is false', () => {
    expect(component.canSubmit()).toBe(false);
  });

  it('becomes submittable once email and password are both valid', () => {
    component.form.setValue({ email: 'maria.alvarez@clouddesk.io', password: 'Password123!', rememberMe: false });

    expect(component.canSubmit()).toBe(true);
  });

  it('stays invalid with a malformed email or a too-short password', () => {
    component.form.setValue({ email: 'not-an-email', password: 'short', rememberMe: false });

    expect(component.canSubmit()).toBe(false);
    expect(component.form.controls.email.errors).toHaveProperty('email');
    expect(component.form.controls.password.errors).toHaveProperty('minlength');
  });

  it('does not emit and marks fields touched when submitted while invalid', () => {
    const emitSpy = vi.fn();
    component.submitCredentials.subscribe(emitSpy);

    component.onSubmit();

    expect(emitSpy).not.toHaveBeenCalled();
    expect(component.form.controls.email.touched).toBe(true);
    expect(component.form.controls.password.touched).toBe(true);
  });

  it('emits the exact form value when submitted while valid', () => {
    const emitSpy = vi.fn();
    component.submitCredentials.subscribe(emitSpy);
    component.form.setValue({ email: 'maria.alvarez@clouddesk.io', password: 'Password123!', rememberMe: true });

    component.onSubmit();

    expect(emitSpy).toHaveBeenCalledWith({
      email: 'maria.alvarez@clouddesk.io',
      password: 'Password123!',
      rememberMe: true,
    });
  });

  it('disables the submit button and relabels it while loading, even with a valid form', () => {
    component.form.setValue({ email: 'maria.alvarez@clouddesk.io', password: 'Password123!', rememberMe: false });
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();

    expect(component.canSubmit()).toBe(false);
    const button = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(button.nativeElement.disabled).toBe(true);
    expect(button.nativeElement.textContent).toContain('Signing in');
  });

  it('renders the error banner when errorMessage is set', () => {
    fixture.componentRef.setInput('errorMessage', 'Invalid email or password.');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Invalid email or password.');
  });

  it('renders no error banner when errorMessage is null', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Invalid email or password.');
  });
});