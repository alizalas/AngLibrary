import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ApiError,
  AuthSession,
  AuthTokens,
  Book,
  BookCreateDto,
  BookUpdateDto,
  Genre,
  ImportPayload,
  ImportRecord,
  LoginRequest,
  LoginResponse,
  RecommendationCreateDto,
  RecommendationList,
  RecommendationUpdateDto,
  RegisterRequest,
  User
} from '../models/domain.models';
import { MockDbService } from './mock-db.service';
import { generateId } from '../utils/id.util';

const NETWORK_LATENCY_MS = 350;

@Injectable({
  providedIn: 'root'
})
export class MockApiService {
  constructor(private readonly db: MockDbService) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    const user = this.db
      .users()
      .find(
        ({ username, password }) =>
          username.toLowerCase() === payload.username.toLowerCase() &&
          password === payload.password
      );

    if (!user) {
      return this.httpError({ status: 401, message: 'Invalid credentials' });
    }

    return this.withDelay({
      tokens: this.createTokens(user.id),
      session: {
        userId: user.id,
        username: user.username
      }
    });
  }

  register(payload: RegisterRequest): Observable<LoginResponse> {
    const existing = this.db
      .users()
      .some((user) => user.username.toLowerCase() === payload.username.toLowerCase());

    if (existing) {
      return this.httpError({ status: 409, message: 'Username already exists' });
    }

    const user: User = {
      id: generateId('u'),
      username: payload.username,
      password: payload.password,
      fullName: payload.fullName
    };

    this.db.users().push(user);

    return this.withDelay({
      tokens: this.createTokens(user.id),
      session: {
        userId: user.id,
        username: user.username
      }
    });
  }

  getGenres(): Observable<Genre[]> {
    return this.withDelay(structuredClone(this.db.genres()));
  }

  getBooks(userId: string): Observable<Book[]> {
    const books = this.db.books().filter((book) => book.userId === userId);
    return this.withDelay(structuredClone(books));
  }

  createBook(userId: string, payload: BookCreateDto): Observable<Book> {
    if (!payload.title.trim() || !payload.author.trim()) {
      return this.httpError({ status: 400, message: 'Title and author are required' });
    }

    const timestamp = new Date().toISOString();

    const next: Book = {
      id: generateId('b'),
      userId,
      title: payload.title.trim(),
      author: payload.author.trim(),
      year: payload.year,
      publisher: payload.publisher.trim(),
      genres: [...payload.genres],
      status: payload.status,
      rating: payload.status === 'finished' ? payload.rating : null,
      notes: payload.notes.trim(),
      quotes: payload.quotes.trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
      finishedAt: payload.status === 'finished' ? timestamp : null
    };

    this.db.books().push(next);

    return this.withDelay(structuredClone(next));
  }

  updateBook(userId: string, bookId: string, payload: BookUpdateDto): Observable<Book> {
    const target = this.db
      .books()
      .find((book) => book.userId === userId && book.id === bookId);

    if (!target) {
      return this.httpError({ status: 404, message: 'Book not found' });
    }

    if (payload.title !== undefined) {
      target.title = payload.title.trim();
    }

    if (payload.author !== undefined) {
      target.author = payload.author.trim();
    }

    if (payload.publisher !== undefined) {
      target.publisher = payload.publisher.trim();
    }

    if (payload.year !== undefined) {
      target.year = payload.year;
    }

    if (payload.genres !== undefined) {
      target.genres = [...payload.genres];
    }

    if (payload.notes !== undefined) {
      target.notes = payload.notes.trim();
    }

    if (payload.quotes !== undefined) {
      target.quotes = payload.quotes.trim();
    }

    if (payload.status !== undefined) {
      target.status = payload.status;
      target.finishedAt = payload.status === 'finished' ? new Date().toISOString() : null;
      if (payload.status !== 'finished') {
        target.rating = null;
      }
    }

    if (payload.rating !== undefined) {
      target.rating = target.status === 'finished' ? payload.rating : null;
    }

    target.updatedAt = new Date().toISOString();

    return this.withDelay(structuredClone(target));
  }

  deleteBook(userId: string, bookId: string): Observable<{ success: true }> {
    const books = this.db.books();
    const idx = books.findIndex((book) => book.userId === userId && book.id === bookId);

    if (idx === -1) {
      return this.httpError({ status: 404, message: 'Book not found' });
    }

    books.splice(idx, 1);

    this.db.recommendations().forEach((list) => {
      list.bookIds = list.bookIds.filter((id) => id !== bookId);
      list.updatedAt = new Date().toISOString();
    });

    return this.withDelay({ success: true });
  }

  getRecommendations(userId: string): Observable<RecommendationList[]> {
    const lists = this.db
      .recommendations()
      .filter((item) => item.userId === userId);

    return this.withDelay(structuredClone(lists));
  }

  createRecommendation(
    userId: string,
    payload: RecommendationCreateDto
  ): Observable<RecommendationList> {
    if (!payload.name.trim()) {
      return this.httpError({ status: 400, message: 'Recommendation name is required' });
    }

    const timestamp = new Date().toISOString();

    const item: RecommendationList = {
      id: generateId('r'),
      userId,
      name: payload.name.trim(),
      description: payload.description.trim(),
      bookIds: [...new Set(payload.bookIds)],
      createdAt: timestamp,
      updatedAt: timestamp
    };

    this.db.recommendations().push(item);

    return this.withDelay(structuredClone(item));
  }

  updateRecommendation(
    userId: string,
    recommendationId: string,
    payload: RecommendationUpdateDto
  ): Observable<RecommendationList> {
    const target = this.db
      .recommendations()
      .find((item) => item.userId === userId && item.id === recommendationId);

    if (!target) {
      return this.httpError({ status: 404, message: 'Recommendation list not found' });
    }

    if (payload.name !== undefined) {
      target.name = payload.name.trim();
    }

    if (payload.description !== undefined) {
      target.description = payload.description.trim();
    }

    if (payload.bookIds !== undefined) {
      target.bookIds = [...new Set(payload.bookIds)];
    }

    target.updatedAt = new Date().toISOString();

    return this.withDelay(structuredClone(target));
  }

  deleteRecommendation(userId: string, recommendationId: string): Observable<{ success: true }> {
    const lists = this.db.recommendations();
    const idx = lists.findIndex(
      (item) => item.userId === userId && item.id === recommendationId
    );

    if (idx === -1) {
      return this.httpError({ status: 404, message: 'Recommendation list not found' });
    }

    lists.splice(idx, 1);

    return this.withDelay({ success: true });
  }

  getImports(userId: string): Observable<ImportRecord[]> {
    const imports = this.db.imports().filter((item) => item.userId === userId);
    return this.withDelay(structuredClone(imports));
  }

  importBooks(userId: string, payload: ImportPayload): Observable<Book[]> {
    if (!payload.books.length) {
      return this.httpError({ status: 400, message: 'Import payload is empty' });
    }

    const createdBooks: Book[] = [];
    payload.books.forEach((bookPayload) => {
      const timestamp = new Date().toISOString();
      const book: Book = {
        id: generateId('b'),
        userId,
        title: bookPayload.title.trim(),
        author: bookPayload.author.trim(),
        year: bookPayload.year,
        publisher: bookPayload.publisher.trim(),
        genres: [...bookPayload.genres],
        status: bookPayload.status,
        rating: bookPayload.status === 'finished' ? bookPayload.rating : null,
        notes: bookPayload.notes.trim(),
        quotes: bookPayload.quotes.trim(),
        createdAt: timestamp,
        updatedAt: timestamp,
        finishedAt: bookPayload.status === 'finished' ? timestamp : null
      };

      this.db.books().push(book);
      createdBooks.push(book);
    });

    const record: ImportRecord = {
      id: generateId('imp'),
      userId,
      source: payload.source,
      importedAt: new Date().toISOString(),
      importedBooks: createdBooks.length
    };

    this.db.imports().push(record);

    return this.withDelay(structuredClone(createdBooks));
  }

  private createTokens(userId: string): AuthTokens {
    const seed = `${userId}:${Date.now()}:${Math.random().toString(36).slice(2, 9)}`;
    const token = btoa(seed);
    const refreshToken = btoa(`${seed}:refresh`);

    return {
      token,
      refreshToken,
      expiresAt: Date.now() + 1000 * 60 * 60 * 8
    };
  }

  private withDelay<T>(value: T): Observable<T> {
    return of(value).pipe(delay(NETWORK_LATENCY_MS));
  }

  private httpError(error: ApiError): Observable<never> {
    return throwError(
      () =>
        new HttpErrorResponse({
          status: error.status,
          error: { message: error.message },
          statusText: error.message
        })
    );
  }
}
