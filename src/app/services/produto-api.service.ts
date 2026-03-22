import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type ProdutoItem = {
  id: number;
  nome: string;
  imagemUrl: string;
  videoUrl: string | null;
  ativo: boolean;
};

@Injectable({ providedIn: 'root' })
export class ProdutoApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getProdutos(): Observable<ProdutoItem[]> {
    return this.http.get<ProdutoItem[]>(`${this.apiBaseUrl}/produtos`);
  }

  getAdminProdutos(): Observable<ProdutoItem[]> {
    return this.http.get<ProdutoItem[]>(`${this.apiBaseUrl}/admin/produtos`);
  }

  createProduto(payload: FormData): Observable<ProdutoItem> {
    return this.http.post<ProdutoItem>(`${this.apiBaseUrl}/produtos`, payload);
  }

  updateProduto(id: number, payload: FormData): Observable<ProdutoItem> {
    return this.http.put<ProdutoItem>(`${this.apiBaseUrl}/produtos/${id}`, payload);
  }

  deleteProduto(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiBaseUrl}/produtos/${id}`);
  }

  reactivateProduto(id: number): Observable<ProdutoItem> {
    return this.http.patch<ProdutoItem>(`${this.apiBaseUrl}/produtos/${id}/reactivate`, {});
  }
}
