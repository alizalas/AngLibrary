import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState
} from '@ngrx/signals';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthApiService } from '../services/api/auth-api.service';
import { TokenService } from '../services/token.service';
import {
  AuthSession,
  LoginRequest,
  RegisterRequest
} from '../models/domain.models';

interface AuthState {
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
}

const initialSession = (): AuthSession | null => {
  try {
    const raw = localStorage.getItem('library.session');
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>({
    session: initialSession(),
    loading: false,
    error: null
  }),
  withComputed((store) => ({
    isAuthenticated: computed(() => Boolean(store.session()))
  })),
  withMethods(
    (
      store,
      authApi = inject(AuthApiService),
      tokenService = inject(TokenService),
      router = inject(Router)
    ) => ({
      login(payload: LoginRequest): void {
        patchState(store, { loading: true, error: null });

        authApi
          .login(payload)
          .pipe(finalize(() => patchState(store, { loading: false })))
          .subscribe({
            next: ({ tokens, session }) => {
              tokenService.saveSession(tokens, session);
              patchState(store, { session, error: null });
              router.navigateByUrl('/library');
            },
            error: (error: unknown) => {
              const message =
                typeof (error as { error?: { message?: string } })?.error?.message ===
                'string'
                  ? (error as { error: { message: string } }).error.message
                  : 'Login failed';

              patchState(store, { error: message });
            }
          });
      },

      register(payload: RegisterRequest): void {
        patchState(store, { loading: true, error: null });

        authApi
          .register(payload)
          .pipe(finalize(() => patchState(store, { loading: false })))
          .subscribe({
            next: ({ tokens, session }) => {
              tokenService.saveSession(tokens, session);
              patchState(store, { session, error: null });
              router.navigateByUrl('/library');
            },
            error: (error: unknown) => {
              const message =
                typeof (error as { error?: { message?: string } })?.error?.message ===
                'string'
                  ? (error as { error: { message: string } }).error.message
                  : 'Registration failed';

              patchState(store, { error: message });
            }
          });
      },

      logout(): void {
        tokenService.clearSession();
        patchState(store, { session: null, error: null });
        router.navigateByUrl('/auth/login');
      },

      restore(): void {
        const session = tokenService.getSession();

        if (session && !tokenService.isTokenExpired()) {
          patchState(store, { session, error: null });
          return;
        }

        tokenService.clearSession();
        patchState(store, { session: null, error: null });
      },

      clearError(): void {
        patchState(store, { error: null });
      }
    })
  )
);
