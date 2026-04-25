export type BookStatus = 'planned' | 'reading' | 'finished';

export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthSession {
  userId: string;
  username: string;
}

export interface Genre {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  userId: string;
  title: string;
  author: string;
  year: number;
  publisher: string;
  genres: string[];
  status: BookStatus;
  rating: number | null;
  notes: string;
  quotes: string;
  createdAt: string;
  updatedAt: string;
  finishedAt: string | null;
}

export interface RecommendationList {
  id: string;
  userId: string;
  name: string;
  description: string;
  bookIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ImportRecord {
  id: string;
  userId: string;
  source: 'json' | 'csv' | 'manual';
  importedAt: string;
  importedBooks: number;
}

export interface AppSettings {
  compactMode: boolean;
  preferredSort: BookSortOption;
}

export type BookSortOption = 'title-asc' | 'year-desc' | 'rating-desc';

export interface BooksFilters {
  query: string;
  status: BookStatus | 'all';
  genreId: string | 'all';
}

export interface SharePayload {
  userId: string;
  generatedAt: string;
}

export interface PeriodStats {
  from: string;
  to: string;
  readCount: number;
}

export interface ApiError {
  status: number;
  message: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  tokens: AuthTokens;
  session: AuthSession;
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
}

export interface BookCreateDto {
  title: string;
  author: string;
  year: number;
  publisher: string;
  genres: string[];
  status: BookStatus;
  rating: number | null;
  notes: string;
  quotes: string;
}

export type BookUpdateDto = Partial<BookCreateDto>;

export interface RecommendationCreateDto {
  name: string;
  description: string;
  bookIds: string[];
}

export type RecommendationUpdateDto = Partial<RecommendationCreateDto>;

export interface ImportPayload {
  source: 'json' | 'csv' | 'manual';
  books: BookCreateDto[];
}
