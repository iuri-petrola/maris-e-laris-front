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
  private readonly usernameStorageKey = 'maris-laris-admin-username';

  constructor(private readonly http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiBaseUrl}/admin/login`, { username, password }).pipe(
      tap((response) => {
        localStorage.setItem(this.tokenStorageKey, response.token);
        localStorage.setItem(this.usernameStorageKey, response.username);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenStorageKey);
    localStorage.removeItem(this.usernameStorageKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.usernameStorageKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
