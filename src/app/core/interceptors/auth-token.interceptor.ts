import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);

  if (!req.url.startsWith('/api') || req.url.startsWith('/api/auth')) {
    return next(req);
  }

  const token = tokenService.getAccessToken();

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  );
};
