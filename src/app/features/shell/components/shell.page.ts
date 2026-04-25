import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TuiButton } from '@taiga-ui/core/components/button';
import { TuiHeader } from '@taiga-ui/layout/components/header';
import {
  TuiAsideComponent,
  TuiAsideItemDirective,
  TuiHeaderComponent,
  TuiMainComponent,
  TuiNavComponent
} from '@taiga-ui/layout/components/navigation';
import { AuthStore } from '../../../core/stores/auth.store';
import { LibraryStore } from '../../../core/stores/library.store';
import { ApiErrorService } from '../../../core/services/api-error.service';
import { ErrorBannerComponent } from '../../../shared/components/error-banner.component';

interface NavItem {
  label: string;
  path: string;
}

@Component({
  selector: 'app-shell-page',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TuiHeader,
    TuiButton,
    TuiHeaderComponent,
    TuiMainComponent,
    TuiAsideComponent,
    TuiAsideItemDirective,
    TuiNavComponent,
    ErrorBannerComponent
  ],
  template: `
    <header tuiNavigationHeader class="app-header">
      <div class="brand-wrap">
        <h1 tuiHeader="h4">LibraryFlow</h1>
        <p>Personal reading tracker</p>
      </div>

      <div class="header-actions">
        <button
          tuiButton
          size="s"
          type="button"
          appearance="flat-grayscale"
          (click)="goToShare()"
        >
          Share
        </button>
        <button tuiButton size="s" type="button" appearance="outline" (click)="logout()">
          Logout
        </button>
      </div>
    </header>

    <main tuiNavigationMain class="app-main">
      <aside [tuiNavigationAside]="true" class="app-aside">
        <nav tuiNavigationNav>
          @for (item of navItems; track item.path) {
            <a
              tuiAsideItem
              [tuiAsideItem]="item.label"
              [routerLink]="item.path"
              routerLinkActive
              #rla="routerLinkActive"
              [routerLinkActiveOptions]="{ exact: item.path === '/library' }"
              [attr.aria-current]="rla.isActive ? 'page' : null"
            >
              {{ item.label }}
            </a>
          }
        </nav>
      </aside>

      <section class="content">
        <app-error-banner [message]="apiError()" (close)="dismissError()" />
        <router-outlet />
      </section>
    </main>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100dvh;
      --surface: linear-gradient(145deg, #f4f8ef 0%, #f2efe9 50%, #e8f0f7 100%);
      background: var(--surface);
    }

    .app-header {
      position: sticky;
      top: 0;
      z-index: 3;
      background: rgba(255, 255, 255, 0.84);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
    }

    .brand-wrap {
      display: grid;
      gap: 0.2rem;
    }

    .brand-wrap h1,
    .brand-wrap p {
      margin: 0;
    }

    .brand-wrap p {
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.875rem;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .app-main {
      display: grid;
      grid-template-columns: 280px minmax(0, 1fr);
      min-height: calc(100dvh - 72px);
    }

    .app-aside {
      position: sticky;
      top: 72px;
      align-self: start;
      height: calc(100dvh - 72px);
      border-right: 1px solid rgba(0, 0, 0, 0.06);
      background: rgba(255, 255, 255, 0.72);
      padding: 1rem;
      overflow: auto;
    }

    .content {
      padding: 1rem;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    @media (max-width: 1024px) {
      .app-main {
        grid-template-columns: 220px minmax(0, 1fr);
      }
    }

    @media (max-width: 880px) {
      .app-main {
        grid-template-columns: minmax(0, 1fr);
      }

      .app-aside {
        position: static;
        top: auto;
        height: auto;
        border-right: none;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellPage implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly libraryStore = inject(LibraryStore);
  private readonly router = inject(Router);
  private readonly apiErrorService = inject(ApiErrorService);

  readonly apiError = this.apiErrorService.message;

  readonly navItems: NavItem[] = [
    { label: 'Library', path: '/library' },
    { label: 'Recommendations', path: '/recommendations' },
    { label: 'Stats', path: '/stats' },
    { label: 'Import', path: '/import' },
    { label: 'Share', path: '/share' }
  ];

  ngOnInit(): void {
    this.libraryStore.loadInitial();
  }

  logout(): void {
    this.libraryStore.clearStateOnLogout();
    this.authStore.logout();
  }

  goToShare(): void {
    this.router.navigateByUrl('/share');
  }

  dismissError(): void {
    this.apiErrorService.clear();
    this.libraryStore.clearError();
    this.authStore.clearError();
  }
}
