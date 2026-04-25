import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiButton } from '@taiga-ui/core/components/button';
import { TuiLink } from '@taiga-ui/core/components/link';
import { TuiLoader } from '@taiga-ui/core/components/loader';
import { TuiTextfield } from '@taiga-ui/core/components/textfield';
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
  templateUrl: './register.page.html',
  styleUrl: './register.page.css',
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
