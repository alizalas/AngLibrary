import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <article class="empty-state" role="status" aria-live="polite">
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </article>
  `,
  styles: `
    .empty-state {
      padding: 1.5rem;
      border-radius: 1rem;
      border: 1px dashed rgba(0, 0, 0, 0.2);
      background: rgba(255, 255, 255, 0.75);
      text-align: center;
      display: grid;
      gap: 0.5rem;
    }

    .empty-state h3,
    .empty-state p {
      margin: 0;
    }

    .empty-state p {
      color: rgba(0, 0, 0, 0.62);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  @Input() title = 'Nothing to show';
  @Input() description = 'Try changing filters or add new items.';
}
