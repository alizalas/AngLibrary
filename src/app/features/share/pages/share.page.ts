import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TuiButton } from '@taiga-ui/core/components/button';
import { SectionHeaderComponent } from '../../../shared/components/section-header.component';
import { AuthStore } from '../../../core/stores/auth.store';
import { UrlShareService } from '../../../core/services/url-share.service';

@Component({
  selector: 'app-share-page',
  imports: [TuiButton, SectionHeaderComponent],
  templateUrl: './share.page.html',
  styleUrl: './share.page.css',
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
