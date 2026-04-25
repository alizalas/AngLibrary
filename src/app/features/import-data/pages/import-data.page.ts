import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DatePipe } from '@angular/common';
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
  template: `
    <section class="import-page" aria-labelledby="import-title">
      <app-section-header
        title="Import data"
        subtitle="Import books from JSON and review import history."
      />

      <section class="import-form" tuiForm="m">
        <h3>JSON import</h3>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <tui-textfield>
            <label tuiLabel>Source</label>
            <select tuiTextfield formControlName="source">
              <option value="json">json</option>
              <option value="csv">csv</option>
              <option value="manual">manual</option>
            </select>
          </tui-textfield>

          <tui-textfield>
            <label tuiLabel>Payload</label>
            <textarea
              tuiTextarea
              formControlName="payload"
              rows="8"
              placeholder='[{"title":"Book","author":"Name","year":2020,"publisher":"Pub","genres":["g-classic"],"status":"planned","rating":null,"notes":"","quotes":""}]'
            ></textarea>
          </tui-textfield>

          @if (parseError) {
            <p class="error">{{ parseError }}</p>
          }

          <button tuiButton type="submit" appearance="primary" [disabled]="store.loading().imports">
            Import books
          </button>
        </form>
      </section>

      <section class="import-history">
        <h3>Import history</h3>

        @if (!store.imports().length) {
          <p class="muted">No imports yet.</p>
        } @else {
          <ul role="list">
            @for (item of store.imports(); track item.id) {
              <li>
                <span>{{ item.importedAt | date: 'medium' }}</span>
                <strong>{{ item.source }}</strong>
                <span>{{ item.importedBooks }} books</span>
              </li>
            }
          </ul>
        }
      </section>
    </section>
  `,
  styles: `
    .import-page {
      display: grid;
      gap: 1rem;
    }

    .import-form,
    .import-history {
      display: grid;
      gap: 0.75rem;
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.92);
      padding: 1rem;
    }

    .import-form h3,
    .import-history h3 {
      margin: 0;
    }

    form {
      display: grid;
      gap: 0.75rem;
    }

    .error {
      margin: 0;
      color: #b3261e;
    }

    .muted {
      margin: 0;
      color: rgba(0, 0, 0, 0.65);
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 0.5rem;
    }

    li {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
      justify-content: space-between;
      border: 1px solid rgba(0, 0, 0, 0.06);
      border-radius: 0.7rem;
      padding: 0.6rem 0.75rem;
      background: rgba(255, 255, 255, 0.95);
    }
  `,
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
