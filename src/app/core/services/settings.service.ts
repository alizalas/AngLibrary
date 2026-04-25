import { Injectable, signal } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage.constants';
import { AppSettings } from '../models/domain.models';
import { LocalStorageService } from './local-storage.service';

const DEFAULT_SETTINGS: AppSettings = {
  compactMode: false,
  preferredSort: 'title-asc'
};

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  readonly settings = signal<AppSettings>(DEFAULT_SETTINGS);

  constructor(private readonly storage: LocalStorageService) {
    const saved = this.storage.getObject<AppSettings>(STORAGE_KEYS.settings);

    if (saved) {
      this.settings.set({ ...DEFAULT_SETTINGS, ...saved });
    }
  }

  update(patch: Partial<AppSettings>): void {
    const next = { ...this.settings(), ...patch };
    this.settings.set(next);
    this.storage.setObject(STORAGE_KEYS.settings, next);
  }
}
