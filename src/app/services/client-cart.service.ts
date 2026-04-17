import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type CartProduto = {
  id: number;
  nome: string;
  preco: number;
  imagemUrl: string;
  videoUrl: string | null;
};

export type CartItem = {
  id: number;
  quantidade: number;
  subtotal: number;
  produto: CartProduto;
};

export type CartSummary = {
  items: CartItem[];
  total: number;
};

@Injectable({ providedIn: 'root' })
export class ClientCartService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getCart(): Observable<CartSummary> {
    return this.http.get<CartSummary>(`${this.apiBaseUrl}/client/cart`);
  }

  addItem(produtoId: number, quantidade = 1): Observable<CartSummary> {
    return this.http.post<CartSummary>(`${this.apiBaseUrl}/client/cart/items`, { produtoId, quantidade });
  }

  updateItem(itemId: number, quantidade: number): Observable<CartSummary> {
    return this.http.patch<CartSummary>(`${this.apiBaseUrl}/client/cart/items/${itemId}`, { quantidade });
  }

  removeItem(itemId: number): Observable<CartSummary> {
    return this.http.delete<CartSummary>(`${this.apiBaseUrl}/client/cart/items/${itemId}`);
  }
}
