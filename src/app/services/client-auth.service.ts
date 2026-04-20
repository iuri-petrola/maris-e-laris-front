import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

type ClientLoginResponse = {
  token: string;
  nome: string;
  contato?: string;
};

export type ClientProfile = {
  id: number;
  nome: string;
  contato: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
};

@Injectable({ providedIn: 'root' })
export class ClientAuthService {
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly tokenStorageKey = 'maris-laris-client-token';
  private readonly nomeStorageKey = 'maris-laris-client-nome';
  private readonly contatoStorageKey = 'maris-laris-client-contato';
  private readonly clientNomeSubject = new BehaviorSubject<string | null>(localStorage.getItem(this.nomeStorageKey));
  readonly clientNome$ = this.clientNomeSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  setSession(token: string, nome: string, contato?: string): void {
    localStorage.setItem(this.tokenStorageKey, token);
    localStorage.setItem(this.nomeStorageKey, nome);
    if (contato) {
      localStorage.setItem(this.contatoStorageKey, contato);
    }
    this.clientNomeSubject.next(nome);
  }

  login(nome: string, contato: string): Observable<ClientLoginResponse> {
    return this.http.post<ClientLoginResponse>(`${this.apiBaseUrl}/client/login`, { nome, contato }).pipe(
      tap((response) => {
        this.setSession(response.token, response.nome, response.contato ?? contato);
      })
    );
  }

  loginByContact(nome: string, contato: string): Observable<ClientLoginResponse> {
    return this.http.post<ClientLoginResponse>(`${this.apiBaseUrl}/client/contact-login`, { nome, contato }).pipe(
      tap((response) => {
        this.setSession(response.token, response.nome, response.contato ?? contato);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenStorageKey);
    localStorage.removeItem(this.nomeStorageKey);
    localStorage.removeItem(this.contatoStorageKey);
    this.clientNomeSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  getNome(): string | null {
    return localStorage.getItem(this.nomeStorageKey);
  }

  getContato(): string | null {
    return localStorage.getItem(this.contatoStorageKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getProfile(): Observable<ClientProfile> {
    return this.http.get<ClientProfile>(`${this.apiBaseUrl}/client/me`);
  }
}
