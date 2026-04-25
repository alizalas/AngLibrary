import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ApiErrorService } from '../services/api-error.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ApiErrorService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const backendMessage =
          typeof error.error?.message === 'string' ? error.error.message : null;
        const fallback = `Request failed with status ${error.status}`;
        errorService.push(backendMessage ?? fallback);
      }

      return throwError(() => error);
    })
  );
};
