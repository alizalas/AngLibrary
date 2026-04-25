import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  getString(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setString(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // localStorage can be unavailable in private mode
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // noop
    }
  }

  getObject<T>(key: string): T | null {
    const raw = this.getString(key);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  setObject<T>(key: string, value: T): void {
    this.setString(key, JSON.stringify(value));
  }
}
