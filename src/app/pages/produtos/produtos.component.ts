import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProdutoApiService, ProdutoItem } from '../../services/produto-api.service';
import { ClientAuthService } from '../../services/client-auth.service';
import { CurrentPedidoService } from '../../services/current-pedido.service';
import { PedidoApiService } from '../../services/pedido-api.service';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.scss']
})
export class ProdutosComponent implements OnInit {
  produtos: ProdutoItem[] = [];
  loading = true;
  errorMessage = '';
  modalOpen = false;
  modalLoading = false;
  modalErrorMessage = '';
  selectedProduto: ProdutoItem | null = null;
  nome = '';
  contato = '';

  constructor(
    private readonly produtoApiService: ProdutoApiService,
    private readonly pedidoApiService: PedidoApiService,
    private readonly clientAuthService: ClientAuthService,
    private readonly currentPedidoService: CurrentPedidoService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.produtoApiService.getProdutos().subscribe({
      next: (data) => {
        this.produtos = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Nao foi possivel carregar os produtos.';
        this.loading = false;
      }
    });
  }

  formatPrice(value: number | null | undefined): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value ?? 0));
  }

  openBuyModal(item: ProdutoItem): void {
    const savedNome = this.clientAuthService.getNome();
    const savedContato = this.clientAuthService.getContato();

    if (savedNome && savedContato) {
      this.createPedidoAndOpenWhatsApp(item, savedNome, savedContato);
      return;
    }

    this.selectedProduto = item;
    this.modalOpen = true;
    this.modalErrorMessage = '';
    this.modalLoading = false;
    this.nome = '';
    this.contato = '';
  }

  closeBuyModal(): void {
    this.modalOpen = false;
    this.modalLoading = false;
    this.modalErrorMessage = '';
    this.selectedProduto = null;
  }

  submitBuy(): void {
    if (!this.selectedProduto) {
      return;
    }

    if (!this.nome.trim() || !this.contato.trim()) {
      this.modalErrorMessage = 'Preencha nome e contato.';
      return;
    }

    this.modalLoading = true;
    this.modalErrorMessage = '';

    this.createPedidoAndOpenWhatsApp(this.selectedProduto, this.nome.trim(), this.contato.trim(), true);
  }

  private createPedidoAndOpenWhatsApp(
    item: ProdutoItem,
    nome: string,
    contato: string,
    closeModalOnSuccess = false
  ): void {
    this.modalLoading = true;
    this.modalErrorMessage = '';

    this.pedidoApiService.create({
      nome,
      contato,
      produtoId: item.id,
      numero: this.currentPedidoService.getNumero() ?? undefined
    }).subscribe({
      next: (pedido) => {
        this.modalLoading = false;
        this.clientAuthService.setSession(pedido.client.token, pedido.client.nome, pedido.client.contato);
        this.currentPedidoService.setNumero(pedido.numero);

        if (closeModalOnSuccess) {
          this.closeBuyModal();
        }

        this.router.navigate(['/cliente/carrinho']);
      },
      error: (error) => {
        this.modalLoading = false;
        this.modalErrorMessage = error?.error?.error || 'Nao foi possivel concluir o pedido.';
      }
    });
  }
}
