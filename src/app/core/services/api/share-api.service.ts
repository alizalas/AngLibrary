import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Book } from '../../models/domain.models';

@Injectable({
  providedIn: 'root'
})
export class ShareApiService {
  constructor(private readonly http: HttpClient) {}

  getSharedLibrary(userId: string): Observable<Book[]> {
    return this.http.get<Book[]>(`/api/share/${userId}/books`);
  }
}
