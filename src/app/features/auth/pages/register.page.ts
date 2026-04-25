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

interface RegisterForm {
  fullName: FormControl<string>;
  username: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-register-page',
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
      <section class="auth-card" tuiForm="m" aria-labelledby="register-title">
        <header>
          <h1 id="register-title">Create account</h1>
          <p>Account is isolated by user id and protected with jwt-like token.</p>
        </header>

        <app-error-banner [message]="authStore.error()" (close)="clearError()" />

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <tui-textfield>
            <label tuiLabel>Full name</label>
            <input
              tuiTextfield
              formControlName="fullName"
              autocomplete="name"
              [attr.aria-invalid]="isInvalid('fullName')"
            />
          </tui-textfield>

          @if (isInvalid('fullName')) {
            <p class="field-error">Full name is required.</p>
          }

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
            <p class="field-error">Username is required and should be at least 3 symbols.</p>
          }

          <tui-textfield>
            <label tuiLabel>Password</label>
            <input
              tuiTextfield
              formControlName="password"
              type="password"
              autocomplete="new-password"
              [attr.aria-invalid]="isInvalid('password')"
            />
          </tui-textfield>

          @if (isInvalid('password')) {
            <p class="field-error">Password should be at least 6 symbols.</p>
          }

          <button
            tuiButton
            type="submit"
            appearance="primary"
            [disabled]="form.invalid || authStore.loading()"
          >
            <tui-loader [showLoader]="authStore.loading()" size="xs" [inheritColor]="true">
              Create account
            </tui-loader>
          </button>
        </form>

        <footer>
          <span>Already registered?</span>
          <a tuiLink [routerLink]="['/auth/login']">Go to login</a>
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
        radial-gradient(circle at 80% 15%, rgba(255, 151, 93, 0.26), transparent 44%),
        radial-gradient(circle at 12% 85%, rgba(81, 170, 255, 0.24), transparent 40%),
        linear-gradient(160deg, #fbfcff 0%, #f3f8ef 100%);
    }

    .auth-card {
      width: min(100%, 460px);
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
export class RegisterPage {
  readonly authStore = inject(AuthStore);

  readonly form = new FormGroup<RegisterForm>({
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)]
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

    this.authStore.register(this.form.getRawValue());
  }

  isInvalid(field: keyof RegisterForm): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }

  clearError(): void {
    this.authStore.clearError();
  }
}
