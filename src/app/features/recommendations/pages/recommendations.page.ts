import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TuiButton } from '@taiga-ui/core/components/button';
import { TuiTextfield } from '@taiga-ui/core/components/textfield';
import { TuiForm } from '@taiga-ui/layout/components/form';
import {
  RecommendationCreateDto,
  RecommendationList,
  RecommendationUpdateDto
} from '../../../core/models/domain.models';
import { LibraryStore } from '../../../core/stores/library.store';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { SectionHeaderComponent } from '../../../shared/components/section-header.component';

interface RecommendationForm {
  name: FormControl<string>;
  description: FormControl<string>;
  bookIds: FormControl<string[]>;
}

@Component({
  selector: 'app-recommendations-page',
  imports: [
    ReactiveFormsModule,
    TuiButton,
    TuiTextfield,
    TuiForm,
    EmptyStateComponent,
    SectionHeaderComponent
  ],
  template: `
    <section class="recommendations-page" aria-labelledby="recommendations-title">
      <app-section-header
        title="Recommendations"
        subtitle="Create and manage your recommendation lists."
      />

      <section class="recommendation-form" tuiForm="m">
        <h3>{{ editingId() ? 'Edit list' : 'New list' }}</h3>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <tui-textfield>
            <label tuiLabel>List name</label>
            <input tuiTextfield formControlName="name" />
          </tui-textfield>

          <tui-textfield>
            <label tuiLabel>Description</label>
            <input tuiTextfield formControlName="description" />
          </tui-textfield>

          <fieldset class="books-select">
            <legend>Books in list</legend>
            <div class="books-grid">
              @for (book of store.books(); track book.id) {
                <label class="book-option">
                  <input
                    type="checkbox"
                    [checked]="isBookSelected(book.id)"
                    (change)="toggleBook(book.id, $any($event.target).checked)"
                  />
                  <span>{{ book.title }}</span>
                </label>
              }
            </div>
          </fieldset>

          <div class="actions">
            @if (editingId()) {
              <button tuiButton type="button" appearance="outline" (click)="resetForm()">
                Cancel
              </button>
            }
            <button tuiButton type="submit" appearance="primary" [disabled]="form.invalid">
              {{ editingId() ? 'Save' : 'Create' }}
            </button>
          </div>
        </form>
      </section>

      @if (!store.recommendations().length) {
        <app-empty-state
          title="No recommendation lists yet"
          description="Create your first recommendation list above."
        />
      } @else {
        <ul class="recommendations-list" role="list">
          @for (list of store.recommendations(); track list.id) {
            <li class="recommendation-card" role="listitem">
              <header>
                <h3>{{ list.name }}</h3>
                <p>{{ list.description || 'No description' }}</p>
              </header>

              <p class="books-line">
                Books:
                @if (booksInList(list).length) {
                  {{ booksInList(list).join(', ') }}
                } @else {
                  none
                }
              </p>

              <footer>
                <button tuiButton type="button" size="s" appearance="outline" (click)="edit(list)">
                  Edit
                </button>
                <button
                  tuiButton
                  type="button"
                  size="s"
                  appearance="flat-destructive"
                  (click)="remove(list.id, list.name)"
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
    .recommendations-page {
      display: grid;
      gap: 1rem;
    }

    .recommendation-form {
      display: grid;
      gap: 0.75rem;
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.9);
      padding: 1rem;
    }

    .recommendation-form h3 {
      margin: 0;
    }

    form {
      display: grid;
      gap: 0.75rem;
    }

    .books-select {
      margin: 0;
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 0.75rem;
      padding: 0.75rem;
    }

    .books-select legend {
      padding: 0 0.35rem;
      font-weight: 600;
    }

    .books-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.45rem;
    }

    .book-option {
      display: flex;
      gap: 0.45rem;
      align-items: center;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .recommendations-list {
      margin: 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: 0.75rem;
    }

    .recommendation-card {
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.92);
      padding: 1rem;
      display: grid;
      gap: 0.6rem;
    }

    .recommendation-card h3,
    .recommendation-card p {
      margin: 0;
    }

    .recommendation-card p {
      color: rgba(0, 0, 0, 0.72);
    }

    .books-line {
      font-size: 0.92rem;
    }

    footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationsPage {
  readonly store = inject(LibraryStore);

  readonly editingId = signal<string | null>(null);

  readonly bookTitleMap = computed(() => {
    const map = new Map<string, string>();
    this.store.books().forEach((book) => map.set(book.id, book.title));
    return map;
  });

  readonly form = new FormGroup<RecommendationForm>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    }),
    description: new FormControl('', {
      nonNullable: true
    }),
    bookIds: new FormControl<string[]>([], {
      nonNullable: true
    })
  });

  isBookSelected(bookId: string): boolean {
    return this.form.controls.bookIds.value.includes(bookId);
  }

  toggleBook(bookId: string, checked: boolean): void {
    const current = this.form.controls.bookIds.value;
    const next = checked
      ? [...new Set([...current, bookId])]
      : current.filter((id) => id !== bookId);

    this.form.controls.bookIds.setValue(next);
    this.form.controls.bookIds.markAsDirty();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    if (this.editingId()) {
      const payload: RecommendationUpdateDto = {
        name: value.name,
        description: value.description,
        bookIds: value.bookIds
      };

      this.store.updateRecommendation(this.editingId() as string, payload);
      this.resetForm();
      return;
    }

    const payload: RecommendationCreateDto = {
      name: value.name,
      description: value.description,
      bookIds: value.bookIds
    };

    this.store.createRecommendation(payload);
    this.resetForm();
  }

  edit(list: RecommendationList): void {
    this.editingId.set(list.id);
    this.form.reset(
      {
        name: list.name,
        description: list.description,
        bookIds: [...list.bookIds]
      },
      { emitEvent: false }
    );
  }

  remove(listId: string, listName: string): void {
    if (!window.confirm(`Delete recommendation list \"${listName}\"?`)) {
      return;
    }

    this.store.deleteRecommendation(listId);

    if (this.editingId() === listId) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.editingId.set(null);
    this.form.reset(
      {
        name: '',
        description: '',
        bookIds: []
      },
      { emitEvent: false }
    );
  }

  booksInList(list: RecommendationList): string[] {
    return list.bookIds.map((id) => this.bookTitleMap().get(id) ?? id);
  }
}
