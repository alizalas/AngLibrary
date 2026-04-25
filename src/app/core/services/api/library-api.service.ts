import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Book,
  BookCreateDto,
  BookUpdateDto,
  Genre,
  ImportPayload,
  ImportRecord,
  RecommendationCreateDto,
  RecommendationList,
  RecommendationUpdateDto
} from '../../models/domain.models';

@Injectable({
  providedIn: 'root'
})
export class LibraryApiService {
  constructor(private readonly http: HttpClient) {}

  getGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>('/api/genres');
  }

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>('/api/books');
  }

  createBook(payload: BookCreateDto): Observable<Book> {
    return this.http.post<Book>('/api/books', payload);
  }

  updateBook(bookId: string, payload: BookUpdateDto): Observable<Book> {
    return this.http.put<Book>(`/api/books/${bookId}`, payload);
  }

  deleteBook(bookId: string): Observable<{ success: true }> {
    return this.http.delete<{ success: true }>(`/api/books/${bookId}`);
  }

  getRecommendations(): Observable<RecommendationList[]> {
    return this.http.get<RecommendationList[]>('/api/recommendations');
  }

  createRecommendation(payload: RecommendationCreateDto): Observable<RecommendationList> {
    return this.http.post<RecommendationList>('/api/recommendations', payload);
  }

  updateRecommendation(
    recommendationId: string,
    payload: RecommendationUpdateDto
  ): Observable<RecommendationList> {
    return this.http.put<RecommendationList>(
      `/api/recommendations/${recommendationId}`,
      payload
    );
  }

  deleteRecommendation(recommendationId: string): Observable<{ success: true }> {
    return this.http.delete<{ success: true }>(`/api/recommendations/${recommendationId}`);
  }

  getImports(): Observable<ImportRecord[]> {
    return this.http.get<ImportRecord[]>('/api/imports');
  }

  importBooks(payload: ImportPayload): Observable<Book[]> {
    return this.http.post<Book[]>('/api/import', payload);
  }
}
