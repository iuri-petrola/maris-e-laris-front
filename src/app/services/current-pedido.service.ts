import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CurrentPedidoService {
  private readonly storageKey = 'maris-laris-current-pedido-numero';

  getNumero(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  setNumero(numero: string): void {
    localStorage.setItem(this.storageKey, numero);
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }
}
