import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiTextfield } from '@taiga-ui/core/components/textfield';
import { TuiForm } from '@taiga-ui/layout/components/form';
import { SectionHeaderComponent } from '../../../shared/components/section-header.component';
import { LibraryStore } from '../../../core/stores/library.store';
import { lastDaysRange } from '../../../shared/utils/date-range.util';

@Component({
  selector: 'app-stats-page',
  imports: [TuiTextfield, TuiForm, SectionHeaderComponent],
  template: `
    <section class="stats-page" aria-labelledby="stats-title">
      <app-section-header
        title="Reading stats"
        subtitle="Track progress and finished books for selected period."
      />

      <section class="stats-grid">
        <article class="stat-card">
          <h3>Total books</h3>
          <p>{{ store.books().length }}</p>
        </article>

        <article class="stat-card">
          <h3>Read progress</h3>
          <p>{{ store.readProgress() }}%</p>
        </article>

        <article class="stat-card">
          <h3>Finished in period</h3>
          <p>{{ store.periodReadCount() }}</p>
        </article>
      </section>

      <section class="period-form" tuiForm="m">
        <h3>Period</h3>

        <div class="period-controls">
          <tui-textfield>
            <label tuiLabel>From</label>
            <input
              tuiTextfield
              type="date"
              [value]="store.statsFrom()"
              (change)="setFrom($any($event.target).value)"
            />
          </tui-textfield>

          <tui-textfield>
            <label tuiLabel>To</label>
            <input
              tuiTextfield
              type="date"
              [value]="store.statsTo()"
              (change)="setTo($any($event.target).value)"
            />
          </tui-textfield>
        </div>

        <div class="period-shortcuts">
          <button type="button" (click)="applyLastDays(7)">Last 7 days</button>
          <button type="button" (click)="applyLastDays(30)">Last 30 days</button>
          <button type="button" (click)="applyLastDays(90)">Last 90 days</button>
        </div>
      </section>

      <section class="top-genres">
        <h3>Top genres</h3>

        @if (!store.topGenres().length) {
          <p class="muted">No genre data yet.</p>
        } @else {
          <ol>
            @for (genre of store.topGenres(); track genre.id) {
              <li>
                <span>{{ genre.name }}</span>
                <strong>{{ genre.count }}</strong>
              </li>
            }
          </ol>
        }
      </section>
    </section>
  `,
  styles: `
    .stats-page {
      display: grid;
      gap: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.75rem;
    }

    .stat-card {
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.92);
      padding: 1rem;
      display: grid;
      gap: 0.3rem;
    }

    .stat-card h3,
    .stat-card p {
      margin: 0;
    }

    .stat-card p {
      font-size: 1.8rem;
      font-weight: 700;
    }

    .period-form,
    .top-genres {
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.92);
      padding: 1rem;
      display: grid;
      gap: 0.75rem;
    }

    .period-form h3,
    .top-genres h3 {
      margin: 0;
    }

    .period-controls {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
    }

    .period-shortcuts {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .period-shortcuts button {
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.95);
      padding: 0.35rem 0.7rem;
      cursor: pointer;
    }

    .top-genres ol {
      margin: 0;
      padding-left: 1.1rem;
      display: grid;
      gap: 0.35rem;
    }

    .top-genres li {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      align-items: center;
    }

    .muted {
      margin: 0;
      color: rgba(0, 0, 0, 0.65);
    }

    @media (max-width: 900px) {
      .stats-grid {
        grid-template-columns: minmax(0, 1fr);
      }

      .period-controls {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `,
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
