import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TuiHeader } from '@taiga-ui/layout/components/header';

@Component({
  selector: 'app-section-header',
  imports: [TuiHeader],
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
