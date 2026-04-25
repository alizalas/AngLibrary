import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { TuiButton } from '@taiga-ui/core/components/button';
import { TuiTextfield } from '@taiga-ui/core/components/textfield';
import { TuiForm } from '@taiga-ui/layout/components/form';
import { BookFormComponent, BookFormSubmit } from '../components/book-form.component';
import { LibraryStore } from '../../../core/stores/library.store';
import { Book, BookSortOption, BookStatus } from '../../../core/models/domain.models';
import {
  BOOK_STATUS_OPTIONS,
  SORT_OPTIONS
} from '../../../shared/constants/library.constants';
import { PageLoaderComponent } from '../../../shared/components/page-loader.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { SectionHeaderComponent } from '../../../shared/components/section-header.component';

@Component({
  selector: 'app-library-page',
  imports: [
    TuiButton,
    TuiTextfield,
    TuiForm,
    BookFormComponent,
    PageLoaderComponent,
    EmptyStateComponent,
    SectionHeaderComponent
  ],
  templateUrl: './library.page.html',
  styleUrl: './library.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibraryPage {
  readonly store = inject(LibraryStore);

  readonly statusOptions = BOOK_STATUS_OPTIONS;
  readonly sortOptions = SORT_OPTIONS;

  readonly formVisible = signal(false);
  readonly editingBook = signal<Book | null>(null);

  private readonly genreNames = computed(() => {
    const map = new Map<string, string>();
    this.store.genres().forEach((genre) => map.set(genre.id, genre.name));
    return map;
  });

  openCreateForm(): void {
    this.editingBook.set(null);
    this.formVisible.set(true);
  }

  closeForm(): void {
    this.editingBook.set(null);
    this.formVisible.set(false);
  }

  edit(book: Book): void {
    this.editingBook.set(book);
    this.formVisible.set(true);
  }

  save(event: BookFormSubmit): void {
    if (event.id) {
      this.store.updateBook(event.id, event.payload);
    } else {
      this.store.createBook(event.payload);
    }

    this.closeForm();
  }

  remove(bookId: string, title: string): void {
    if (!window.confirm(`Delete \"${title}\"?`)) {
      return;
    }

    this.store.deleteBook(bookId);
  }

  setQuery(query: string): void {
    this.store.setFilters({ query });
  }

  setStatus(status: string): void {
    this.store.setFilters({ status: status as BookStatus | 'all' });
  }

  setGenre(genreId: string): void {
    this.store.setFilters({ genreId });
  }

  setSort(sort: string): void {
    this.store.setSort(sort as BookSortOption);
  }

  genresLabel(ids: string[]): string {
    return ids.map((id) => this.genreNames().get(id) ?? id).join(', ');
  }

  statusLabel(status: BookStatus): string {
    if (status === 'planned') {
      return 'Planned';
    }

    if (status === 'reading') {
      return 'Reading';
    }

    return 'Finished';
  }
}
