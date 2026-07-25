import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { LoginForm } from '../login-form/login-form';
import { LoginCredentials } from '../../auth.model';

@Component({
  selector: 'app-login-page',
  imports: [LoginForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  handleSubmit(credentials: LoginCredentials): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    setTimeout(() => {
      this.loading.set(false);
      if (credentials.email == "fail@clouddesk.io") {
        this.errorMessage.set("Invalid email or password");
        return;
      }
      console.log('Logged in as ', credentials.email);
    }, 700);
  }

}
