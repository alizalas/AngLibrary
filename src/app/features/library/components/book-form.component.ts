import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
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
import { TuiCheckbox } from '@taiga-ui/kit/components/checkbox';
import { TuiTextarea } from '@taiga-ui/kit/components/textarea';
import { Book, BookCreateDto, BookStatus, Genre } from '../../../core/models/domain.models';
import { YEAR_OPTIONS } from '../../../shared/constants/library.constants';

interface BookForm {
  title: FormControl<string>;
  author: FormControl<string>;
  year: FormControl<number>;
  publisher: FormControl<string>;
  status: FormControl<BookStatus>;
  rating: FormControl<number | null>;
  notes: FormControl<string>;
  quotes: FormControl<string>;
  genres: FormControl<string[]>;
}

export interface BookFormSubmit {
  id?: string;
  payload: BookCreateDto;
}

@Component({
  selector: 'app-book-form',
  imports: [ReactiveFormsModule, TuiButton, TuiTextfield, TuiForm, TuiTextarea, TuiCheckbox],
  template: `
    <section class="book-form" tuiForm="m" aria-labelledby="book-form-title">
      <header class="book-form__head">
        <h3 id="book-form-title">{{ book ? 'Edit book' : 'Add book' }}</h3>
        <p>Fill metadata, reading status, notes and key quotes.</p>
      </header>

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="book-form__row">
          <tui-textfield>
            <label tuiLabel>Title</label>
            <input tuiTextfield formControlName="title" />
          </tui-textfield>

          <tui-textfield>
            <label tuiLabel>Author</label>
            <input tuiTextfield formControlName="author" />
          </tui-textfield>
        </div>

        <div class="book-form__row">
          <tui-textfield>
            <label tuiLabel>Year</label>
            <input
              tuiTextfield
              type="number"
              formControlName="year"
              [min]="yearMin"
              [max]="yearMax"
            />
          </tui-textfield>

          <tui-textfield>
            <label tuiLabel>Publisher</label>
            <input tuiTextfield formControlName="publisher" />
          </tui-textfield>
        </div>

        <div class="book-form__row">
          <tui-textfield>
            <label tuiLabel>Status</label>
            <select tuiTextfield formControlName="status" (change)="onStatusChanged()">
              @for (status of statusOptions; track status.value) {
                <option [value]="status.value">{{ status.label }}</option>
              }
            </select>
          </tui-textfield>

          <tui-textfield>
            <label tuiLabel>Rating (1-5)</label>
            <input
              tuiTextfield
              type="number"
              formControlName="rating"
              min="1"
              max="5"
              [readonly]="form.controls.status.value !== 'finished'"
            />
          </tui-textfield>
        </div>

        <fieldset class="genres-group">
          <legend>Genres</legend>
          <div class="genres-grid">
            @for (genre of genres; track genre.id) {
              <label class="genre-item">
                <input
                  tuiCheckbox
                  type="checkbox"
                  [checked]="isGenreSelected(genre.id)"
                  (change)="toggleGenre(genre.id, $any($event.target).checked)"
                />
                <span>{{ genre.name }}</span>
              </label>
            }
          </div>
        </fieldset>

        <tui-textfield>
          <label tuiLabel>Notes</label>
          <textarea tuiTextarea formControlName="notes" rows="3"></textarea>
        </tui-textfield>

        <tui-textfield>
          <label tuiLabel>Quotes</label>
          <textarea tuiTextarea formControlName="quotes" rows="3"></textarea>
        </tui-textfield>

        @if (form.invalid && submitted) {
          <p class="form-error">Please fill required fields and check numeric ranges.</p>
        }

        <div class="book-form__actions">
          <button tuiButton type="button" appearance="outline" (click)="cancel.emit()">Cancel</button>
          <button tuiButton type="submit" appearance="primary">
            {{ book ? 'Save changes' : 'Create book' }}
          </button>
        </div>
      </form>
    </section>
  `,
  styles: `
    .book-form {
      display: grid;
      gap: 1rem;
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.9);
      padding: 1rem;
    }

    .book-form__head {
      display: grid;
      gap: 0.2rem;
    }

    .book-form__head h3,
    .book-form__head p {
      margin: 0;
    }

    .book-form__head p {
      color: rgba(0, 0, 0, 0.6);
    }

    form {
      display: grid;
      gap: 0.8rem;
    }

    .book-form__row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
    }

    .genres-group {
      margin: 0;
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 0.75rem;
      padding: 0.75rem;
      display: grid;
      gap: 0.6rem;
    }

    .genres-group legend {
      padding: 0 0.35rem;
      color: rgba(0, 0, 0, 0.75);
      font-weight: 600;
    }

    .genres-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.5rem;
    }

    .genre-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .book-form__actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.6rem;
      flex-wrap: wrap;
    }

    .form-error {
      margin: 0;
      color: #b3261e;
    }

    @media (max-width: 700px) {
      .book-form__row {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookFormComponent implements OnChanges {
  @Input() book: Book | null = null;
  @Input() genres: Genre[] = [];
  @Output() saved = new EventEmitter<BookFormSubmit>();
  @Output() cancel = new EventEmitter<void>();

  readonly yearMin = YEAR_OPTIONS.min;
  readonly yearMax = YEAR_OPTIONS.max;
  readonly statusOptions: Array<{ value: BookStatus; label: string }> = [
    { value: 'planned', label: 'Planned' },
    { value: 'reading', label: 'Reading' },
    { value: 'finished', label: 'Finished' }
  ];

  submitted = false;

  readonly form = new FormGroup<BookForm>({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    }),
    author: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    }),
    year: new FormControl(new Date().getFullYear(), {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.min(YEAR_OPTIONS.min),
        Validators.max(YEAR_OPTIONS.max)
      ]
    }),
    publisher: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    }),
    status: new FormControl<BookStatus>('planned', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    rating: new FormControl<number | null>(null, {
      validators: [Validators.min(1), Validators.max(5)]
    }),
    notes: new FormControl('', { nonNullable: true }),
    quotes: new FormControl('', { nonNullable: true }),
    genres: new FormControl<string[]>([], {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['book']) {
      this.resetForm();
    }
  }

  isGenreSelected(genreId: string): boolean {
    return this.form.controls.genres.value.includes(genreId);
  }

  toggleGenre(genreId: string, checked: boolean): void {
    const current = this.form.controls.genres.value;

    const next = checked
      ? [...new Set([...current, genreId])]
      : current.filter((id) => id !== genreId);

    this.form.controls.genres.setValue(next);
    this.form.controls.genres.markAsDirty();
  }

  onStatusChanged(): void {
    if (this.form.controls.status.value !== 'finished') {
      this.form.controls.rating.setValue(null);
    }
  }

  submit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: BookCreateDto = {
      ...this.form.getRawValue(),
      rating:
        this.form.controls.status.value === 'finished'
          ? this.form.controls.rating.value
          : null
    };

    this.saved.emit({
      id: this.book?.id,
      payload
    });
  }

  private resetForm(): void {
    this.submitted = false;

    if (this.book) {
      this.form.reset(
        {
          title: this.book.title,
          author: this.book.author,
          year: this.book.year,
          publisher: this.book.publisher,
          status: this.book.status,
          rating: this.book.rating,
          notes: this.book.notes,
          quotes: this.book.quotes,
          genres: [...this.book.genres]
        },
        { emitEvent: false }
      );

      return;
    }

    this.form.reset(
      {
        title: '',
        author: '',
        year: new Date().getFullYear(),
        publisher: '',
        status: 'planned',
        rating: null,
        notes: '',
        quotes: '',
        genres: []
      },
      { emitEvent: false }
    );
  }
}
