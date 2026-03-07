import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type ProdutoItem = {
  id: number;
  nome: string;
  imagemUrl: string;
};

@Injectable({ providedIn: 'root' })
export class ProdutoApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getProdutos(): Observable<ProdutoItem[]> {
    return this.http.get<ProdutoItem[]>(`${this.apiBaseUrl}/produtos`);
  }
}
