import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TuiButton } from '@taiga-ui/core/components/button';
import { TuiTextfield } from '@taiga-ui/core/components/textfield';
import { TuiForm } from '@taiga-ui/layout/components/form';
import { TuiTextarea } from '@taiga-ui/kit/components/textarea';
import { SectionHeaderComponent } from '../../../shared/components/section-header.component';
import { LibraryStore } from '../../../core/stores/library.store';
import {
  BookCreateDto,
  ImportPayload,
  BookStatus
} from '../../../core/models/domain.models';

interface ImportForm {
  source: FormControl<ImportPayload['source']>;
  payload: FormControl<string>;
}

@Component({
  selector: 'app-import-data-page',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    TuiButton,
    TuiTextfield,
    TuiForm,
    TuiTextarea,
    SectionHeaderComponent
  ],
  templateUrl: './import-data.page.html',
  styleUrl: './import-data.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportDataPage {
  readonly store = inject(LibraryStore);

  parseError: string | null = null;

  readonly form = new FormGroup<ImportForm>({
    source: new FormControl<ImportPayload['source']>('json', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    payload: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.parseError = null;

    let parsed: unknown;
    try {
      parsed = JSON.parse(this.form.controls.payload.value);
    } catch {
      this.parseError = 'Payload must be valid JSON array.';
      return;
    }

    if (!Array.isArray(parsed) || !parsed.length) {
      this.parseError = 'Provide a non-empty JSON array of books.';
      return;
    }

    const books = parsed
      .map((item) => this.normalizeBook(item))
      .filter((item): item is BookCreateDto => item !== null);

    if (!books.length) {
      this.parseError = 'Cannot parse any valid book from payload.';
      return;
    }

    this.store.importBooks({
      source: this.form.controls.source.value,
      books
    });

    this.form.controls.payload.reset('', { emitEvent: false });
  }

  private normalizeBook(raw: unknown): BookCreateDto | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    const item = raw as Record<string, unknown>;

    const title = typeof item['title'] === 'string' ? item['title'].trim() : '';
    const author = typeof item['author'] === 'string' ? item['author'].trim() : '';
    const yearValue = item['year'];
    const publisher =
      typeof item['publisher'] === 'string' ? item['publisher'].trim() : '';
    const status = this.normalizeStatus(item['status']);
    const rating = this.normalizeRating(item['rating']);
    const notes = typeof item['notes'] === 'string' ? item['notes'] : '';
    const quotes = typeof item['quotes'] === 'string' ? item['quotes'] : '';

    const genres = Array.isArray(item['genres'])
      ? item['genres'].filter((genre): genre is string => typeof genre === 'string')
      : [];

    const year = typeof yearValue === 'number' ? yearValue : Number(yearValue);

    if (!title || !author || !publisher || !Number.isFinite(year)) {
      return null;
    }

    return {
      title,
      author,
      year,
      publisher,
      genres,
      status,
      rating: status === 'finished' ? rating : null,
      notes,
      quotes
    };
  }

  private normalizeStatus(value: unknown): BookStatus {
    if (value === 'reading' || value === 'finished' || value === 'planned') {
      return value;
    }

    return 'planned';
  }

  private normalizeRating(value: unknown): number | null {
    if (typeof value === 'number' && value >= 1 && value <= 5) {
      return value;
    }

    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 5) {
      return parsed;
    }

    return null;
  }
}
