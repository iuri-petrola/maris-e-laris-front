import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProdutoApiService, ProdutoItem } from '../../services/produto-api.service';
import { ClientAuthService, ClientProfile } from '../../services/client-auth.service';
import { ClientCartService } from '../../services/client-cart.service';

@Component({
  selector: 'app-cliente-area',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cliente-area.component.html',
  styleUrls: ['./cliente-area.component.scss']
})
export class ClienteAreaComponent implements OnInit {
  loading = true;
  errorMessage = '';
  profile: ClientProfile | null = null;
  produtos: ProdutoItem[] = [];
  cartLoading = false;
  cartMessage = '';
  successPopupMessage = '';
  private popupTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly clientAuthService: ClientAuthService,
    private readonly produtoApiService: ProdutoApiService,
    private readonly clientCartService: ClientCartService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadArea();
  }

  loadArea(): void {
    this.loading = true;
    this.errorMessage = '';

    this.clientAuthService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.loadProdutos();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.error || 'Nao foi possivel carregar sua area.';
      }
    });
  }

  loadProdutos(): void {
    this.produtoApiService.getProdutos().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Nao foi possivel carregar os produtos.';
      }
    });
  }

  addToCart(produto: ProdutoItem): void {
    this.cartLoading = true;
    this.cartMessage = '';

    this.clientCartService.addItem(produto.id).subscribe({
      next: () => {
        this.cartLoading = false;
        this.cartMessage = '';
        this.showSuccessPopup();
      },
      error: (error) => {
        this.cartLoading = false;
        this.cartMessage = error?.error?.error || 'Nao foi possivel adicionar o produto.';
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

  closeSuccessPopup(): void {
    this.successPopupMessage = '';

    if (this.popupTimeout) {
      clearTimeout(this.popupTimeout);
      this.popupTimeout = undefined;
    }

    this.router.navigate(['/cliente/carrinho']);
  }

  private showSuccessPopup(): void {
    this.successPopupMessage = 'Produto adicionado ao carrinho com sucesso !';

    if (this.popupTimeout) {
      clearTimeout(this.popupTimeout);
    }

    this.popupTimeout = setTimeout(() => {
      this.closeSuccessPopup();
    }, 3000);
  }
}
