import { BookSortOption, BookStatus } from '../../core/models/domain.models';

export const BOOK_STATUS_OPTIONS: ReadonlyArray<{ value: BookStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'planned', label: 'Planned' },
  { value: 'reading', label: 'Reading' },
  { value: 'finished', label: 'Finished' }
];

export const SORT_OPTIONS: ReadonlyArray<{ value: BookSortOption; label: string }> = [
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'year-desc', label: 'Year (new first)' },
  { value: 'rating-desc', label: 'Rating (high first)' }
];

export const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
  planned: 'Planned',
  reading: 'Reading',
  finished: 'Finished'
};

export const YEAR_OPTIONS = {
  min: 1450,
  max: new Date().getFullYear()
} as const;
