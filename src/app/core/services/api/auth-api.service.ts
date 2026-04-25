import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest
} from '../../models/domain.models';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  constructor(private readonly http: HttpClient) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', payload);
  }

  register(payload: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/register', payload);
  }
}
