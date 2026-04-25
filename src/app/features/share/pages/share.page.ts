import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TuiButton } from '@taiga-ui/core/components/button';
import { SectionHeaderComponent } from '../../../shared/components/section-header.component';
import { AuthStore } from '../../../core/stores/auth.store';
import { UrlShareService } from '../../../core/services/url-share.service';

@Component({
  selector: 'app-share-page',
  imports: [TuiButton, SectionHeaderComponent],
  template: `
    <section class="share-page" aria-labelledby="share-title">
      <app-section-header
        title="Share library"
        subtitle="Generate and copy public read-only link to your library."
      />

      <article class="share-card">
        <h3>Your public link</h3>

        @if (shareUrl(); as url) {
          <p class="share-url">{{ url }}</p>

          <div class="actions">
            <button tuiButton type="button" appearance="primary" (click)="copy(url)">
              Copy link
            </button>
            <a tuiButton appearance="outline" [href]="url" target="_blank" rel="noreferrer">
              Open shared page
            </a>
          </div>

          @if (copied()) {
            <p class="hint" role="status" aria-live="polite">Link copied to clipboard.</p>
          }
        } @else {
          <p class="hint">Login required to generate share link.</p>
        }
      </article>
    </section>
  `,
  styles: `
    .share-page {
      display: grid;
      gap: 1rem;
    }

    .share-card {
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.92);
      padding: 1rem;
      display: grid;
      gap: 0.75rem;
    }

    .share-card h3,
    .hint {
      margin: 0;
    }

    .share-url {
      margin: 0;
      padding: 0.75rem;
      border: 1px dashed rgba(0, 0, 0, 0.2);
      border-radius: 0.75rem;
      word-break: break-all;
      background: rgba(255, 255, 255, 0.88);
    }

    .actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .hint {
      color: rgba(0, 0, 0, 0.68);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SharePage {
  private readonly authStore = inject(AuthStore);
  private readonly shareService = inject(UrlShareService);

  readonly copied = signal(false);

  readonly shareUrl = computed(() => {
    const session = this.authStore.session();
    return session ? this.shareService.makeSharedLink(session.userId) : '';
  });

  async copy(value: string): Promise<void> {
    this.copied.set(false);

    try {
      await navigator.clipboard.writeText(value);
      this.copied.set(true);
    } catch {
      this.copied.set(false);
    }
  }
}
