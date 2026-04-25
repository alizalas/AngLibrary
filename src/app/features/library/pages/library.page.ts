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
  template: `
    <section class="library-page" aria-labelledby="library-title">
      <app-section-header
        title="Library"
        subtitle="Manage your books, statuses, notes, quotes and genres."
      />

      <section class="controls" tuiForm="m" aria-label="Filters and sorting">
        <tui-textfield>
          <label tuiLabel>Search</label>
          <input
            tuiTextfield
            [value]="store.filters().query"
            placeholder="Title, author or publisher"
            (input)="setQuery($any($event.target).value)"
          />
        </tui-textfield>

        <tui-textfield>
          <label tuiLabel>Status</label>
          <select
            tuiTextfield
            [value]="store.filters().status"
            (change)="setStatus($any($event.target).value)"
          >
            @for (option of statusOptions; track option.value) {
              <option [value]="option.value">{{ option.label }}</option>
            }
          </select>
        </tui-textfield>

        <tui-textfield>
          <label tuiLabel>Genre</label>
          <select
            tuiTextfield
            [value]="store.filters().genreId"
            (change)="setGenre($any($event.target).value)"
          >
            <option value="all">All genres</option>
            @for (genre of store.genres(); track genre.id) {
              <option [value]="genre.id">{{ genre.name }}</option>
            }
          </select>
        </tui-textfield>

        <tui-textfield>
          <label tuiLabel>Sort</label>
          <select
            tuiTextfield
            [value]="store.sort()"
            (change)="setSort($any($event.target).value)"
          >
            @for (option of sortOptions; track option.value) {
              <option [value]="option.value">{{ option.label }}</option>
            }
          </select>
        </tui-textfield>
      </section>

      <div class="toolbar">
        <button tuiButton type="button" appearance="primary" (click)="openCreateForm()">
          Add book
        </button>
        @if (formVisible()) {
          <button tuiButton type="button" appearance="outline" (click)="closeForm()">
            Close form
          </button>
        }
      </div>

      @if (formVisible()) {
        <app-book-form
          [book]="editingBook()"
          [genres]="store.genres()"
          (saved)="save($event)"
          (cancel)="closeForm()"
        />
      }

      @if (store.loading().books && !store.initialized()) {
        <app-page-loader label="Loading books..." />
      } @else if (!store.filteredBooks().length) {
        <app-empty-state
          title="No books found"
          description="Add your first book or change filters."
        />
      } @else {
        <ul class="books-list" role="list">
          @for (book of store.filteredBooks(); track book.id) {
            <li class="book-card" role="listitem">
              <header class="book-card__head">
                <div>
                  <h3>{{ book.title }}</h3>
                  <p>{{ book.author }} • {{ book.year }} • {{ book.publisher }}</p>
                </div>
                <div class="book-card__meta">
                  <span class="status" [class]="'status status--' + book.status">
                    {{ statusLabel(book.status) }}
                  </span>
                  @if (book.rating) {
                    <span class="rating" aria-label="Rating">★ {{ book.rating }}/5</span>
                  }
                </div>
              </header>

              <p class="genres">Genres: {{ genresLabel(book.genres) }}</p>

              @if (book.notes) {
                <p><strong>Notes:</strong> {{ book.notes }}</p>
              }

              @if (book.quotes) {
                <p><strong>Quotes:</strong> {{ book.quotes }}</p>
              }

              <footer class="book-card__actions">
                <button tuiButton type="button" size="s" appearance="outline" (click)="edit(book)">
                  Edit
                </button>
                <button
                  tuiButton
                  type="button"
                  size="s"
                  appearance="flat-destructive"
                  (click)="remove(book.id, book.title)"
                >
                  Delete
                </button>
              </footer>
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: `
    .library-page {
      display: grid;
      gap: 1rem;
    }

    .controls {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.75rem;
      padding: 0.9rem;
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.86);
    }

    .toolbar {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
    }

    .books-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 0.75rem;
    }

    .book-card {
      display: grid;
      gap: 0.65rem;
      border-radius: 1rem;
      border: 1px solid rgba(0, 0, 0, 0.08);
      background: rgba(255, 255, 255, 0.92);
      padding: 1rem;
    }

    .book-card__head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }

    .book-card h3,
    .book-card p {
      margin: 0;
    }

    .book-card__head p {
      color: rgba(0, 0, 0, 0.65);
      font-size: 0.92rem;
    }

    .book-card__meta {
      display: flex;
      gap: 0.45rem;
      flex-wrap: wrap;
    }

    .status,
    .rating {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 0.25rem 0.6rem;
      font-size: 0.78rem;
      font-weight: 600;
      background: rgba(0, 0, 0, 0.08);
    }

    .status--planned {
      background: rgba(255, 186, 73, 0.25);
    }

    .status--reading {
      background: rgba(93, 162, 255, 0.22);
    }

    .status--finished {
      background: rgba(120, 191, 94, 0.28);
    }

    .genres {
      color: rgba(0, 0, 0, 0.72);
      font-size: 0.9rem;
    }

    .book-card__actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    @media (max-width: 1100px) {
      .controls {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 700px) {
      .controls {
        grid-template-columns: minmax(0, 1fr);
      }

      .book-card__head {
        flex-direction: column;
      }
    }
  `,
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
