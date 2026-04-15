import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

type ClientLoginResponse = {
  token: string;
  nome: string;
};

export type ClientProfile = {
  id: number;
  nome: string;
  email: string;
  whatsapp: string;
  ativo: boolean;
  createdAt: string;
};

@Injectable({ providedIn: 'root' })
export class ClientAuthService {
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly tokenStorageKey = 'maris-laris-client-token';
  private readonly nomeStorageKey = 'maris-laris-client-nome';

  constructor(private readonly http: HttpClient) {}

  login(nome: string, password: string): Observable<ClientLoginResponse> {
    return this.http.post<ClientLoginResponse>(`${this.apiBaseUrl}/client/login`, { nome, password }).pipe(
      tap((response) => {
        localStorage.setItem(this.tokenStorageKey, response.token);
        localStorage.setItem(this.nomeStorageKey, response.nome);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenStorageKey);
    localStorage.removeItem(this.nomeStorageKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  getNome(): string | null {
    return localStorage.getItem(this.nomeStorageKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getProfile(): Observable<ClientProfile> {
    return this.http.get<ClientProfile>(`${this.apiBaseUrl}/client/me`);
  }
}
