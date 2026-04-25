import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState
} from '@ngrx/signals';
import { finalize } from 'rxjs';
import { AuthStore } from './auth.store';
import { LibraryApiService } from '../services/api/library-api.service';
import {
  Book,
  BookCreateDto,
  BookSortOption,
  BookUpdateDto,
  BooksFilters,
  Genre,
  ImportPayload,
  ImportRecord,
  RecommendationCreateDto,
  RecommendationList,
  RecommendationUpdateDto
} from '../models/domain.models';

type LoadingKey = 'books' | 'recommendations' | 'imports';

interface LibraryState {
  books: Book[];
  genres: Genre[];
  recommendations: RecommendationList[];
  imports: ImportRecord[];
  filters: BooksFilters;
  sort: BookSortOption;
  statsFrom: string;
  statsTo: string;
  loading: Record<LoadingKey, boolean>;
  error: string | null;
  initialized: boolean;
}

const defaultDateFrom = (): string => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
};

const defaultDateTo = (): string => new Date().toISOString().slice(0, 10);

const toDate = (value: string): Date => new Date(`${value}T00:00:00`);

const parseError = (error: unknown, fallback: string): string => {
  const maybeMessage = (error as { error?: { message?: string } })?.error?.message;
  return typeof maybeMessage === 'string' ? maybeMessage : fallback;
};

const sortBooks = (books: Book[], sort: BookSortOption): Book[] => {
  const items = [...books];

  if (sort === 'title-asc') {
    return items.sort((a, b) => a.title.localeCompare(b.title));
  }

  if (sort === 'year-desc') {
    return items.sort((a, b) => b.year - a.year);
  }

  return items.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
};

export const LibraryStore = signalStore(
  { providedIn: 'root' },
  withState<LibraryState>({
    books: [],
    genres: [],
    recommendations: [],
    imports: [],
    filters: {
      query: '',
      status: 'all',
      genreId: 'all'
    },
    sort: 'title-asc',
    statsFrom: defaultDateFrom(),
    statsTo: defaultDateTo(),
    loading: {
      books: false,
      recommendations: false,
      imports: false
    },
    error: null,
    initialized: false
  }),
  withComputed((store) => ({
    filteredBooks: computed(() => {
      const query = store.filters().query.trim().toLowerCase();

      const filtered = store.books().filter((book) => {
        const matchesQuery =
          !query ||
          [book.title, book.author, book.publisher].some((field) =>
            field.toLowerCase().includes(query)
          );

        const matchesStatus =
          store.filters().status === 'all' || book.status === store.filters().status;

        const matchesGenre =
          store.filters().genreId === 'all' ||
          book.genres.includes(store.filters().genreId);

        return matchesQuery && matchesStatus && matchesGenre;
      });

      return sortBooks(filtered, store.sort());
    }),

    readProgress: computed(() => {
      const books = store.books();

      if (!books.length) {
        return 0;
      }

      const finished = books.filter((book) => book.status === 'finished').length;
      return Math.round((finished / books.length) * 100);
    }),

    periodReadCount: computed(() => {
      const from = toDate(store.statsFrom());
      const to = toDate(store.statsTo());
      const toEnd = new Date(to);
      toEnd.setHours(23, 59, 59, 999);

      return store.books().filter((book) => {
        if (!book.finishedAt) {
          return false;
        }

        const finishedAt = new Date(book.finishedAt);
        return finishedAt >= from && finishedAt <= toEnd;
      }).length;
    }),

    topGenres: computed(() => {
      const countMap = new Map<string, number>();

      store.books().forEach((book) => {
        book.genres.forEach((genreId) => {
          countMap.set(genreId, (countMap.get(genreId) ?? 0) + 1);
        });
      });

      return [...countMap.entries()]
        .map(([id, count]) => {
          const genre = store.genres().find((g) => g.id === id);
          return {
            id,
            name: genre?.name ?? id,
            count
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    })
  })),
  withMethods((store, api = inject(LibraryApiService), authStore = inject(AuthStore)) => ({
    loadInitial(): void {
      if (!authStore.session()) {
        return;
      }

      patchState(store, {
        loading: {
          ...store.loading(),
          books: true,
          recommendations: true,
          imports: true
        },
        error: null
      });

      api
        .getGenres()
        .pipe(finalize(() => patchState(store, { loading: { ...store.loading(), books: false } })))
        .subscribe({
          next: (genres) => patchState(store, { genres }),
          error: (error: unknown) =>
            patchState(store, { error: parseError(error, 'Failed to load genres') })
        });

      api
        .getBooks()
        .pipe(finalize(() => patchState(store, { loading: { ...store.loading(), books: false } })))
        .subscribe({
          next: (books) => patchState(store, { books, initialized: true }),
          error: (error: unknown) =>
            patchState(store, { error: parseError(error, 'Failed to load books') })
        });

      api
        .getRecommendations()
        .pipe(
          finalize(() =>
            patchState(store, {
              loading: { ...store.loading(), recommendations: false }
            })
          )
        )
        .subscribe({
          next: (recommendations) => patchState(store, { recommendations }),
          error: (error: unknown) =>
            patchState(store, {
              error: parseError(error, 'Failed to load recommendations')
            })
        });

      api
        .getImports()
        .pipe(finalize(() => patchState(store, { loading: { ...store.loading(), imports: false } })))
        .subscribe({
          next: (imports) => patchState(store, { imports }),
          error: (error: unknown) =>
            patchState(store, {
              error: parseError(error, 'Failed to load import history')
            })
        });
    },

    refreshBooks(): void {
      if (!authStore.session()) {
        return;
      }

      patchState(store, {
        loading: {
          ...store.loading(),
          books: true
        }
      });

      api
        .getBooks()
        .pipe(finalize(() => patchState(store, { loading: { ...store.loading(), books: false } })))
        .subscribe({
          next: (books) => patchState(store, { books }),
          error: (error: unknown) =>
            patchState(store, {
              error: parseError(error, 'Failed to refresh books')
            })
        });
    },

    setSort(sort: BookSortOption): void {
      patchState(store, { sort });
    },

    setFilters(filters: Partial<BooksFilters>): void {
      patchState(store, {
        filters: {
          ...store.filters(),
          ...filters
        }
      });
    },

    setStatsPeriod(from: string, to: string): void {
      patchState(store, {
        statsFrom: from,
        statsTo: to
      });
    },

    createBook(payload: BookCreateDto): void {
      api.createBook(payload).subscribe({
        next: (book) => {
          patchState(store, {
            books: [...store.books(), book],
            error: null
          });
        },
        error: (error: unknown) =>
          patchState(store, { error: parseError(error, 'Failed to create book') })
      });
    },

    updateBook(bookId: string, payload: BookUpdateDto): void {
      api.updateBook(bookId, payload).subscribe({
        next: (book) => {
          patchState(store, {
            books: store.books().map((item) => (item.id === book.id ? book : item)),
            error: null
          });
        },
        error: (error: unknown) =>
          patchState(store, { error: parseError(error, 'Failed to update book') })
      });
    },

    deleteBook(bookId: string): void {
      api.deleteBook(bookId).subscribe({
        next: () => {
          patchState(store, {
            books: store.books().filter((item) => item.id !== bookId),
            recommendations: store
              .recommendations()
              .map((list) => ({
                ...list,
                bookIds: list.bookIds.filter((id) => id !== bookId)
              })),
            error: null
          });
        },
        error: (error: unknown) =>
          patchState(store, { error: parseError(error, 'Failed to delete book') })
      });
    },

    createRecommendation(payload: RecommendationCreateDto): void {
      api.createRecommendation(payload).subscribe({
        next: (recommendation) => {
          patchState(store, {
            recommendations: [...store.recommendations(), recommendation],
            error: null
          });
        },
        error: (error: unknown) =>
          patchState(store, {
            error: parseError(error, 'Failed to create recommendation list')
          })
      });
    },

    updateRecommendation(
      recommendationId: string,
      payload: RecommendationUpdateDto
    ): void {
      api.updateRecommendation(recommendationId, payload).subscribe({
        next: (recommendation) => {
          patchState(store, {
            recommendations: store
              .recommendations()
              .map((item) => (item.id === recommendation.id ? recommendation : item)),
            error: null
          });
        },
        error: (error: unknown) =>
          patchState(store, {
            error: parseError(error, 'Failed to update recommendation list')
          })
      });
    },

    deleteRecommendation(recommendationId: string): void {
      api.deleteRecommendation(recommendationId).subscribe({
        next: () => {
          patchState(store, {
            recommendations: store
              .recommendations()
              .filter((item) => item.id !== recommendationId),
            error: null
          });
        },
        error: (error: unknown) =>
          patchState(store, {
            error: parseError(error, 'Failed to delete recommendation list')
          })
      });
    },

    importBooks(payload: ImportPayload): void {
      patchState(store, {
        loading: {
          ...store.loading(),
          imports: true
        }
      });

      api
        .importBooks(payload)
        .pipe(finalize(() => patchState(store, { loading: { ...store.loading(), imports: false } })))
        .subscribe({
          next: (newBooks) => {
            patchState(store, {
              books: [...store.books(), ...newBooks],
              error: null
            });

            api.getImports().subscribe({
              next: (imports) => patchState(store, { imports }),
              error: () => undefined
            });
          },
          error: (error: unknown) =>
            patchState(store, {
              error: parseError(error, 'Failed to import books')
            })
        });
    },

    clearStateOnLogout(): void {
      patchState(store, {
        books: [],
        recommendations: [],
        imports: [],
        initialized: false
      });
    },

    clearError(): void {
      patchState(store, { error: null });
    }
  }))
);
