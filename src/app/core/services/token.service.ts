import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage.constants';
import { AuthSession, AuthTokens } from '../models/domain.models';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  constructor(private readonly storage: LocalStorageService) {}

  saveSession(tokens: AuthTokens, session: AuthSession): void {
    this.storage.setString(STORAGE_KEYS.token, tokens.token);
    this.storage.setString(STORAGE_KEYS.refreshToken, tokens.refreshToken);
    this.storage.setString(STORAGE_KEYS.expiresAt, String(tokens.expiresAt));
    this.storage.setObject(STORAGE_KEYS.session, session);
  }

  clearSession(): void {
    this.storage.remove(STORAGE_KEYS.token);
    this.storage.remove(STORAGE_KEYS.refreshToken);
    this.storage.remove(STORAGE_KEYS.expiresAt);
    this.storage.remove(STORAGE_KEYS.session);
  }

  getAccessToken(): string | null {
    return this.storage.getString(STORAGE_KEYS.token);
  }

  getRefreshToken(): string | null {
    return this.storage.getString(STORAGE_KEYS.refreshToken);
  }

  getExpiresAt(): number | null {
    const raw = this.storage.getString(STORAGE_KEYS.expiresAt);
    const parsed = raw ? Number(raw) : NaN;

    return Number.isFinite(parsed) ? parsed : null;
  }

  getSession(): AuthSession | null {
    return this.storage.getObject<AuthSession>(STORAGE_KEYS.session);
  }

  isTokenExpired(): boolean {
    const expiresAt = this.getExpiresAt();

    if (!expiresAt) {
      return true;
    }

    return Date.now() >= expiresAt;
  }
}
