import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type PedidoStatus = 'PENDENTE_DE_ENVIO' | 'ENVIADO' | 'EM_ATENDIMENTO' | 'FINALIZADO';

export type AdminPedidoItem = {
  id: number;
  numero: string;
  status: PedidoStatus;
  contato: string;
  createdAt: string;
  quantidade: number;
  clientUser: {
    id: number;
    nome: string;
    contato: string;
  };
  produto: {
    id: number;
    nome: string;
    preco: number;
    imagemUrl: string;
    videoUrl: string | null;
  };
};

@Injectable({ providedIn: 'root' })
export class AdminPedidoApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getPedidos(): Observable<AdminPedidoItem[]> {
    return this.http.get<AdminPedidoItem[]>(`${this.apiBaseUrl}/admin/pedidos`);
  }

  updateStatus(numero: string, status: PedidoStatus): Observable<void> {
    return this.http.patch<void>(`${this.apiBaseUrl}/admin/pedidos/${encodeURIComponent(numero)}/status`, { status });
  }
}
