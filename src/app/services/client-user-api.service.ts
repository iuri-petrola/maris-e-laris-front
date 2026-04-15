import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type ClientUserPayload = {
  nome: string;
  email: string;
  whatsapp: string;
  senha: string;
};

export type ClientUserResponse = {
  id: number;
  nome: string;
  email: string;
  whatsapp: string;
  ativo: boolean;
  createdAt: string;
};

@Injectable({ providedIn: 'root' })
export class ClientUserApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  register(payload: ClientUserPayload): Observable<ClientUserResponse> {
    return this.http.post<ClientUserResponse>(`${this.apiBaseUrl}/client-users/register`, payload);
  }
}
