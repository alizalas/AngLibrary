import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TuiLoader } from '@taiga-ui/core/components/loader';

@Component({
  selector: 'app-page-loader',
  imports: [TuiLoader],
  templateUrl: './page-loader.component.html',
  styleUrl: './page-loader.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageLoaderComponent {
  @Input() label = 'Loading data...';
}
