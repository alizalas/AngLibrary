import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiButton } from '@taiga-ui/core/components/button';
import { TuiTextfield } from '@taiga-ui/core/components/textfield';
import { TuiLoader } from '@taiga-ui/core/components/loader';
import { TuiLink } from '@taiga-ui/core/components/link';
import { TuiForm } from '@taiga-ui/layout/components/form';
import { AuthStore } from '../../../core/stores/auth.store';
import { ErrorBannerComponent } from '../../../shared/components/error-banner.component';

interface LoginForm {
  username: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TuiButton,
    TuiTextfield,
    TuiLoader,
    TuiLink,
    TuiForm,
    ErrorBannerComponent
  ],
  template: `
    <main class="auth-layout">
      <section class="auth-card" tuiForm="m" aria-labelledby="login-title">
        <header>
          <h1 id="login-title">Sign in</h1>
          <p>Use demo account: <code>anna / anna123</code> or <code>ivan / ivan123</code>.</p>
        </header>

        <app-error-banner [message]="authStore.error()" (close)="clearError()" />

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <tui-textfield>
            <label tuiLabel>Username</label>
            <input
              tuiTextfield
              formControlName="username"
              autocomplete="username"
              [attr.aria-invalid]="isInvalid('username')"
            />
          </tui-textfield>

          @if (isInvalid('username')) {
            <p class="field-error">Username is required.</p>
          }

          <tui-textfield>
            <label tuiLabel>Password</label>
            <input
              tuiTextfield
              formControlName="password"
              type="password"
              autocomplete="current-password"
              [attr.aria-invalid]="isInvalid('password')"
            />
          </tui-textfield>

          @if (isInvalid('password')) {
            <p class="field-error">Password should contain at least 6 symbols.</p>
          }

          <button
            tuiButton
            type="submit"
            appearance="primary"
            [disabled]="form.invalid || authStore.loading()"
          >
            <tui-loader [showLoader]="authStore.loading()" size="xs" [inheritColor]="true">
              Login
            </tui-loader>
          </button>
        </form>

        <footer>
          <span>No account yet?</span>
          <a tuiLink [routerLink]="['/auth/register']">Create one</a>
        </footer>
      </section>
    </main>
  `,
  styles: `
    .auth-layout {
      min-height: 100dvh;
      display: grid;
      place-items: center;
      padding: 1rem;
      background:
        radial-gradient(circle at 15% 15%, rgba(88, 147, 255, 0.25), transparent 45%),
        radial-gradient(circle at 85% 10%, rgba(255, 181, 70, 0.25), transparent 45%),
        linear-gradient(160deg, #f8fbff 0%, #f9f5ea 100%);
    }

    .auth-card {
      width: min(100%, 440px);
      border-radius: 1.25rem;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
      padding: 1.25rem;
      display: grid;
      gap: 1rem;
    }

    header {
      display: grid;
      gap: 0.3rem;
    }

    h1,
    p {
      margin: 0;
    }

    p {
      color: rgba(0, 0, 0, 0.65);
    }

    form {
      display: grid;
      gap: 0.6rem;
    }

    .field-error {
      margin: -0.2rem 0 0;
      color: #b3261e;
      font-size: 0.82rem;
    }

    footer {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
      color: rgba(0, 0, 0, 0.72);
      font-size: 0.9rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPage {
  readonly authStore = inject(AuthStore);

  readonly form = new FormGroup<LoginForm>({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    })
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authStore.login(this.form.getRawValue());
  }

  isInvalid(field: keyof LoginForm): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }

  clearError(): void {
    this.authStore.clearError();
  }
}
