import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TuiHeader } from '@taiga-ui/layout/components/header';

@Component({
  selector: 'app-section-header',
  imports: [TuiHeader],
  template: `
    <header class="section-header">
      <h2 tuiHeader="h3">{{ title }}</h2>
      @if (subtitle) {
        <p>{{ subtitle }}</p>
      }
    </header>
  `,
  styles: `
    .section-header {
      display: grid;
      gap: 0.35rem;
      margin-bottom: 1rem;
    }

    h2 {
      margin: 0;
    }

    p {
      margin: 0;
      color: rgba(0, 0, 0, 0.66);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
