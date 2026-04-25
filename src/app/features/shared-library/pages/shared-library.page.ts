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
  templateUrl: './shared-library.page.html',
  styleUrl: './shared-library.page.css',
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
