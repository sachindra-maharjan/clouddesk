import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { LoginForm } from '../login-form/login-form';
import { LoginCredentials } from '../../auth.model';
import { AuthStore } from '../../login/auth.store';

@Component({
  selector: 'app-login-page',
  imports: [LoginForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {

  protected readonly authStore = inject(AuthStore);

  handleSubmit(credentials: LoginCredentials): void {
    this.authStore.login(credentials);
  }

}
