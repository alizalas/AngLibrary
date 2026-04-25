import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TuiLoader } from '@taiga-ui/core/components/loader';

@Component({
  selector: 'app-page-loader',
  imports: [TuiLoader],
  template: `
    <section class="loader-wrap" [attr.aria-label]="label">
      <tui-loader [showLoader]="true" size="l">{{ label }}</tui-loader>
    </section>
  `,
  styles: `
    .loader-wrap {
      display: grid;
      place-items: center;
      min-height: 240px;
      padding: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageLoaderComponent {
  @Input() label = 'Loading data...';
}
