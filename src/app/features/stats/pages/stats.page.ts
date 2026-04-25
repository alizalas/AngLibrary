import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiTextfield } from '@taiga-ui/core/components/textfield';
import { TuiForm } from '@taiga-ui/layout/components/form';
import { SectionHeaderComponent } from '../../../shared/components/section-header.component';
import { LibraryStore } from '../../../core/stores/library.store';
import { lastDaysRange } from '../../../shared/utils/date-range.util';

@Component({
  selector: 'app-stats-page',
  imports: [TuiTextfield, TuiForm, SectionHeaderComponent],
  templateUrl: './stats.page.html',
  styleUrl: './stats.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatsPage {
  readonly store = inject(LibraryStore);

  setFrom(from: string): void {
    this.store.setStatsPeriod(from, this.store.statsTo());
  }

  setTo(to: string): void {
    this.store.setStatsPeriod(this.store.statsFrom(), to);
  }

  applyLastDays(days: number): void {
    const range = lastDaysRange(days);
    this.store.setStatsPeriod(range.from, range.to);
  }
}
