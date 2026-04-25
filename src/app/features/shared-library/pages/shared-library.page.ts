import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { TuiButton } from '@taiga-ui/core/components/button';
import { ShareApiService } from '../../../core/services/api/share-api.service';
import { Book } from '../../../core/models/domain.models';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { PageLoaderComponent } from '../../../shared/components/page-loader.component';
import { SectionHeaderComponent } from '../../../shared/components/section-header.component';

@Component({
  selector: 'app-shared-library-page',
  imports: [
    RouterLink,
    TuiButton,
    EmptyStateComponent,
    PageLoaderComponent,
    SectionHeaderComponent
  ],
  template: `
    <main class="shared-page" aria-labelledby="shared-title">
      <app-section-header
        title="Shared library"
        subtitle="Read-only public view of books."
      />

      <div class="shared-actions">
        <a tuiButton appearance="outline" [routerLink]="['/auth/login']">Go to login</a>
      </div>

      @if (loading()) {
        <app-page-loader label="Loading shared books..." />
      } @else if (error()) {
        <app-empty-state title="Cannot open shared library" [description]="error() || ''" />
      } @else if (!books().length) {
        <app-empty-state
          title="No books in shared library"
          description="This user has no public books yet."
        />
      } @else {
        <ul class="shared-books" role="list">
          @for (book of books(); track book.id) {
            <li class="shared-book" role="listitem">
              <h3>{{ book.title }}</h3>
              <p>{{ book.author }} • {{ book.year }} • {{ book.publisher }}</p>
              <p>
                <strong>Status:</strong> {{ statusLabel(book.status) }}
                @if (book.rating) {
                  <span> • <strong>Rating:</strong> {{ book.rating }}/5</span>
                }
              </p>
              <p><strong>Genres:</strong> {{ book.genres.join(', ') || 'n/a' }}</p>
              @if (book.quotes) {
                <p><strong>Quote:</strong> {{ book.quotes }}</p>
              }
            </li>
          }
        </ul>
      }
    </main>
  `,
  styles: `
    .shared-page {
      max-width: 900px;
      margin: 0 auto;
      padding: 1rem;
      display: grid;
      gap: 1rem;
      min-height: 100dvh;
      background:
        radial-gradient(circle at 10% 0%, rgba(90, 150, 255, 0.18), transparent 35%),
        radial-gradient(circle at 100% 100%, rgba(84, 190, 120, 0.16), transparent 40%),
        #f7f9fc;
    }

    .shared-actions {
      display: flex;
      justify-content: flex-end;
    }

    .shared-books {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 0.75rem;
    }

    .shared-book {
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.92);
      padding: 1rem;
      display: grid;
      gap: 0.5rem;
    }

    .shared-book h3,
    .shared-book p {
      margin: 0;
    }

    .shared-book p {
      color: rgba(0, 0, 0, 0.72);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SharedLibraryPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly shareApi = inject(ShareApiService);

  readonly books = signal<Book[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');

    if (!userId) {
      this.loading.set(false);
      this.error.set('User id is not specified in URL.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.shareApi
      .getSharedLibrary(userId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (books) => this.books.set(books),
        error: () => this.error.set('Shared library not found or unavailable.')
      });
  }

  statusLabel(status: Book['status']): string {
    if (status === 'planned') {
      return 'Planned';
    }

    if (status === 'reading') {
      return 'Reading';
    }

    return 'Finished';
  }
}
