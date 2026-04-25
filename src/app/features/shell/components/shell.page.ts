import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TuiButton } from '@taiga-ui/core/components/button';
import { TuiHeader } from '@taiga-ui/layout/components/header';
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
  imports: [RouterOutlet, RouterLink, TuiHeader, TuiButton, ErrorBannerComponent],
  templateUrl: './shell.page.html',
  styleUrl: './shell.page.css',
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

  isActive(path: string): boolean {
    return this.router.isActive(path, {
      paths: path === '/library' ? 'exact' : 'subset',
      queryParams: 'ignored',
      matrixParams: 'ignored',
      fragment: 'ignored'
    });
  }

  dismissError(): void {
    this.apiErrorService.clear();
    this.libraryStore.clearError();
    this.authStore.clearError();
  }
}
