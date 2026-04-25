import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TuiButton } from '@taiga-ui/core/components/button';
import { TuiNotification } from '@taiga-ui/core/components/notification';

@Component({
  selector: 'app-error-banner',
  imports: [TuiButton, TuiNotification],
  template: `
    @if (message) {
      <tui-notification class="error-wrap" appearance="negative" icon="@tui.alert-circle">
        <div class="error-content">
          <strong>Request error:</strong>
          <span>{{ message }}</span>
        </div>
        <button
          tuiButton
          type="button"
          size="s"
          appearance="flat-grayscale"
          (click)="close.emit()"
        >
          Dismiss
        </button>
      </tui-notification>
    }
  `,
  styles: `
    .error-wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 0.875rem;
    }

    .error-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 0;
    }

    .error-content span {
      overflow-wrap: anywhere;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorBannerComponent {
  @Input() message: string | null = null;
  @Output() close = new EventEmitter<void>();
}
