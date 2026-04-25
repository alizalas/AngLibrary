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
  templateUrl: './recommendations.page.html',
  styleUrl: './recommendations.page.css',
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
