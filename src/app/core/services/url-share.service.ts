import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UrlShareService {
  makeSharedLink(userId: string): string {
    const url = new URL(window.location.origin);
    url.pathname = `/shared/${encodeURIComponent(userId)}`;
    return url.toString();
  }
}
