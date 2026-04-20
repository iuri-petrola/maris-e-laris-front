import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoPayload, PedidoResponse } from './pedido-api.service';
import { environment } from '../../environments/environment';

export type ClientPedidoItem = {
  id: number;
  numero: string;
  status: string;
  contato: string;
  createdAt: string;
  quantidade: number;
  produto: {
    id: number;
    nome: string;
    preco: number;
    imagemUrl: string;
    videoUrl: string | null;
  };
};

@Injectable({ providedIn: 'root' })
export class ClientPedidoService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getPedidos(): Observable<ClientPedidoItem[]> {
    return this.http.get<ClientPedidoItem[]>(`${this.apiBaseUrl}/client/pedidos`);
  }

  markAsEnviado(numero: string): Observable<void> {
    return this.http.patch<void>(`${this.apiBaseUrl}/client/pedidos/${encodeURIComponent(numero)}/enviar`, {});
  }

  addItem(payload: PedidoPayload): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.apiBaseUrl}/pedidos`, payload);
  }

  removeItem(numero: string, produtoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/client/pedidos/${encodeURIComponent(numero)}/produtos/${produtoId}`);
  }
}
