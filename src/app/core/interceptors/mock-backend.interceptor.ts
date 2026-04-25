import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { MockApiService } from '../services/mock-api.service';
import {
  BookCreateDto,
  BookUpdateDto,
  ImportPayload,
  LoginRequest,
  RecommendationCreateDto,
  RecommendationUpdateDto,
  RegisterRequest
} from '../models/domain.models';

const unauthorized = (): Observable<never> =>
  throwError(
    () =>
      new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        error: { message: 'Please login to continue' }
      })
  );

const notFound = (): Observable<never> =>
  throwError(
    () =>
      new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'Endpoint not found' }
      })
  );

const parsePath = (url: string): string => {
  const parsed = new URL(url, 'http://localhost');
  return parsed.pathname;
};

const getTokenUserId = (request: HttpRequest<unknown>): string | null => {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.replace('Bearer ', '').trim();
    const decoded = atob(token);
    const [userId] = decoded.split(':');
    return userId || null;
  } catch {
    return null;
  }
};

const ok = <T>(source: Observable<T>): Observable<HttpEvent<unknown>> =>
  source.pipe(map((body) => new HttpResponse({ status: 200, body })));

export const mockBackendInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('/api')) {
    return next(request);
  }

  const api = inject(MockApiService);
  const path = parsePath(request.url);

  if (request.method === 'POST' && path === '/api/auth/login') {
    return ok(api.login(request.body as LoginRequest));
  }

  if (request.method === 'POST' && path === '/api/auth/register') {
    return ok(api.register(request.body as RegisterRequest));
  }

  if (request.method === 'GET' && path === '/api/share') {
    return notFound();
  }

  if (request.method === 'GET' && path.startsWith('/api/share/')) {
    const [, , , userId] = path.split('/');

    if (!userId) {
      return notFound();
    }

    if (path.endsWith('/books')) {
      return ok(api.getBooks(userId));
    }

    return notFound();
  }

  const userId = getTokenUserId(request);

  if (!userId) {
    return unauthorized();
  }

  if (request.method === 'GET' && path === '/api/genres') {
    return ok(api.getGenres());
  }

  if (request.method === 'GET' && path === '/api/books') {
    return ok(api.getBooks(userId));
  }

  if (request.method === 'POST' && path === '/api/books') {
    return ok(api.createBook(userId, request.body as BookCreateDto));
  }

  if (path.startsWith('/api/books/')) {
    const bookId = path.split('/')[3];

    if (!bookId) {
      return notFound();
    }

    if (request.method === 'PUT') {
      return ok(api.updateBook(userId, bookId, request.body as BookUpdateDto));
    }

    if (request.method === 'DELETE') {
      return ok(api.deleteBook(userId, bookId));
    }
  }

  if (request.method === 'GET' && path === '/api/recommendations') {
    return ok(api.getRecommendations(userId));
  }

  if (request.method === 'POST' && path === '/api/recommendations') {
    return ok(api.createRecommendation(userId, request.body as RecommendationCreateDto));
  }

  if (path.startsWith('/api/recommendations/')) {
    const recommendationId = path.split('/')[3];

    if (!recommendationId) {
      return notFound();
    }

    if (request.method === 'PUT') {
      return ok(
        api.updateRecommendation(
          userId,
          recommendationId,
          request.body as RecommendationUpdateDto
        )
      );
    }

    if (request.method === 'DELETE') {
      return ok(api.deleteRecommendation(userId, recommendationId));
    }
  }

  if (request.method === 'GET' && path === '/api/imports') {
    return ok(api.getImports(userId));
  }

  if (request.method === 'POST' && path === '/api/import') {
    return ok(api.importBooks(userId, request.body as ImportPayload));
  }

  return notFound();
};
