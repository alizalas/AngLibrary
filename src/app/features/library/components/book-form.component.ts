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
  templateUrl: './book-form.component.html',
  styleUrl: './book-form.component.css',
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
