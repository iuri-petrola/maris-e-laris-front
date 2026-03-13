import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

type LoginResponse = {
  token: string;
  username: string;
};

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly tokenStorageKey = 'maris-laris-admin-token';

  constructor(private readonly http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiBaseUrl}/admin/login`, { username, password })
      .pipe(tap((response) => localStorage.setItem(this.tokenStorageKey, response.token)));
  }

  logout(): void {
    localStorage.removeItem(this.tokenStorageKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
