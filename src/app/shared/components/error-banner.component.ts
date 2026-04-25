import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TuiButton } from '@taiga-ui/core/components/button';
import { TuiNotification } from '@taiga-ui/core/components/notification';

@Component({
  selector: 'app-error-banner',
  imports: [TuiButton, TuiNotification],
  templateUrl: './error-banner.component.html',
  styleUrl: './error-banner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorBannerComponent {
  @Input() message: string | null = null;
  @Output() close = new EventEmitter<void>();
}
