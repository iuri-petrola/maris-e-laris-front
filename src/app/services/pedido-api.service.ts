import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type PedidoPayload = {
  nome: string;
  contato: string;
  produtoId: number;
  numero?: string;
};

export type PedidoResponse = {
  id: number;
  numero: string;
  status: string;
  contato: string;
  clientUserId: number;
  produtoId: number;
  createdAt: string;
  client: {
    nome: string;
    contato: string;
    token: string;
  };
};

@Injectable({ providedIn: 'root' })
export class PedidoApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  create(payload: PedidoPayload): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.apiBaseUrl}/pedidos`, payload);
  }
}
