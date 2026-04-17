import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ClientAuthService } from '../../services/client-auth.service';
import { CartSummary, ClientCartService } from '../../services/client-cart.service';

@Component({
  selector: 'app-cliente-carrinho',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cliente-carrinho.component.html',
  styleUrls: ['./cliente-carrinho.component.scss']
})
export class ClienteCarrinhoComponent implements OnInit {
  loading = true;
  errorMessage = '';
  cart: CartSummary = { items: [], total: 0 };
  cartLoading = false;
  cartMessage = '';

  constructor(
    private readonly clientAuthService: ClientAuthService,
    private readonly clientCartService: ClientCartService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.errorMessage = '';

    this.clientCartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.error || 'Nao foi possivel carregar o carrinho.';
      }
    });
  }

  changeQuantidade(itemId: number, quantidade: number): void {
    this.cartLoading = true;
    this.cartMessage = '';

    this.clientCartService.updateItem(itemId, quantidade).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.cartLoading = false;
      },
      error: (error) => {
        this.cartLoading = false;
        this.cartMessage = error?.error?.error || 'Nao foi possivel atualizar o carrinho.';
      }
    });
  }

  removeItem(itemId: number): void {
    this.cartLoading = true;
    this.cartMessage = '';

    this.clientCartService.removeItem(itemId).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.cartLoading = false;
      },
      error: (error) => {
        this.cartLoading = false;
        this.cartMessage = error?.error?.error || 'Nao foi possivel remover o item.';
      }
    });
  }

  formatPrice(value: number | null | undefined): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value ?? 0));
  }

  logout(): void {
    this.clientAuthService.logout();
    this.router.navigate(['/login']);
  }
}
