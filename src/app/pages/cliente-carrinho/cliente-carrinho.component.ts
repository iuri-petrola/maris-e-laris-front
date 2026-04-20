import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ClientAuthService } from '../../services/client-auth.service';
import { CurrentPedidoService } from '../../services/current-pedido.service';
import { ClientPedidoItem, ClientPedidoService } from '../../services/client-pedido.service';

type GroupedPedidoItem = ClientPedidoItem & {
  quantidade: number;
  subtotal: number;
};

@Component({
  selector: 'app-cliente-carrinho',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cliente-carrinho.component.html',
  styleUrls: ['./cliente-carrinho.component.scss']
})
export class ClienteCarrinhoComponent implements OnInit {
  private readonly whatsappNumber = '5585996270455';

  loading = true;
  errorMessage = '';
  pedidos: GroupedPedidoItem[] = [];
  currentPedidoNumero: string | null = null;
  sendingCurrentPedido = false;
  showSendConfirmation = false;
  updatingItemKey: string | null = null;

  constructor(
    private readonly clientAuthService: ClientAuthService,
    private readonly clientPedidoService: ClientPedidoService,
    private readonly currentPedidoService: CurrentPedidoService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.currentPedidoNumero = this.currentPedidoService.getNumero();
    this.loadPedidos();
  }

  loadPedidos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.clientPedidoService.getPedidos().subscribe({
      next: (pedidos) => {
        const pendingPedidos = pedidos.filter((pedido) => pedido.status === 'PENDENTE_DE_ENVIO');
        this.pedidos = this.groupPedidos(pendingPedidos);

        if (this.pedidos.length > 0) {
          const hasCurrentPedido = this.currentPedidoNumero && this.pedidos.some((pedido) => pedido.numero === this.currentPedidoNumero);

          if (!hasCurrentPedido) {
            this.currentPedidoNumero = this.pedidos[0].numero;
            this.currentPedidoService.setNumero(this.currentPedidoNumero);
          }
        } else {
          this.currentPedidoNumero = null;
          this.currentPedidoService.clear();
        }

        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.error || 'Nao foi possivel carregar os pedidos.';
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
    this.currentPedidoService.clear();
    this.router.navigate(['/produtos']);
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(value));
  }

  isCurrentPedido(numero: string): boolean {
    return this.currentPedidoNumero === numero;
  }


  formatStatus(status: string): string {
    if (status === 'PENDENTE_DE_ENVIO') {
      return 'Pendente de envio';
    }

    if (status === 'EM_ATENDIMENTO') {
      return 'Em atendimento';
    }

    if (status === 'FINALIZADO') {
      return 'Finalizado';
    }

    if (status === 'ENVIADO') {
      return 'Enviado';
    }

    return status;
  }

  getCurrentPedidoItems(): GroupedPedidoItem[] {
    if (!this.currentPedidoNumero) {
      return [];
    }

    return this.pedidos.filter((pedido) => pedido.numero === this.currentPedidoNumero && pedido.status === 'PENDENTE_DE_ENVIO');
  }

  getCurrentPedidoTotal(): number {
    return this.getCurrentPedidoItems().reduce((total, item) => total + item.subtotal, 0);
  }

  getCurrentPedidoStatus(): string {
    const currentItem = this.getCurrentPedidoItems()[0];
    return currentItem ? this.formatStatus(currentItem.status) : '';
  }

  getCurrentPedidoDate(): string {
    const currentItem = this.getCurrentPedidoItems()[0];
    return currentItem ? this.formatDate(currentItem.createdAt) : '';
  }

  isUpdatingItem(numero: string, produtoId: number): boolean {
    return this.updatingItemKey === `${numero}::${produtoId}`;
  }

  increaseItem(pedido: GroupedPedidoItem): void {
    const nome = this.clientAuthService.getNome();
    const contato = this.clientAuthService.getContato();

    if (!nome || !contato || this.sendingCurrentPedido) {
      return;
    }

    this.updatingItemKey = `${pedido.numero}::${pedido.produto.id}`;
    this.clientPedidoService.addItem({
      nome,
      contato,
      produtoId: pedido.produto.id,
      numero: pedido.numero
    }).subscribe({
      next: () => {
        this.updatingItemKey = null;
        this.loadPedidos();
      },
      error: (error) => {
        this.updatingItemKey = null;
        this.errorMessage = error?.error?.error || 'Nao foi possivel atualizar a quantidade.';
      }
    });
  }

  decreaseItem(pedido: GroupedPedidoItem): void {
    if (this.sendingCurrentPedido) {
      return;
    }

    this.updatingItemKey = `${pedido.numero}::${pedido.produto.id}`;
    this.clientPedidoService.removeItem(pedido.numero, pedido.produto.id).subscribe({
      next: () => {
        this.updatingItemKey = null;
        this.loadPedidos();
      },
      error: (error) => {
        this.updatingItemKey = null;
        this.errorMessage = error?.error?.error || 'Nao foi possivel atualizar a quantidade.';
      }
    });
  }

  openSendConfirmation(): void {
    if (this.sendingCurrentPedido || !this.currentPedidoNumero || this.getCurrentPedidoItems().length === 0) {
      return;
    }

    this.showSendConfirmation = true;
  }

  closeSendConfirmation(): void {
    this.showSendConfirmation = false;
  }

  confirmSendCurrentPedido(): void {
    this.showSendConfirmation = false;
    this.sendCurrentPedidoToWhatsApp();
  }

  sendCurrentPedidoToWhatsApp(): void {
    const numero = this.currentPedidoNumero;
    const nome = this.clientAuthService.getNome();
    const contato = this.clientAuthService.getContato();
    const items = this.getCurrentPedidoItems();

    if (!numero || !nome || !contato || items.length === 0) {
      return;
    }

    const lines = [
      'Ola! Finalizei meu pedido.',
      '',
      `Pedido: ${numero}`,
      `Cliente: ${nome}`,
      `Contato: ${contato}`,
      '',
      'Itens:'
    ];

    for (const item of items) {
      const qty = item.quantidade > 1 ? ` x${item.quantidade}` : '';
      lines.push(`- ${item.produto.nome}${qty} - ${this.formatPrice(item.subtotal)}`);
    }

    lines.push('', `Total: ${this.formatPrice(this.getCurrentPedidoTotal())}`);

    const url = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    this.sendingCurrentPedido = true;
    this.clientPedidoService.markAsEnviado(numero).subscribe({
      next: () => {
        this.currentPedidoService.clear();
        this.currentPedidoNumero = null;
        this.loadPedidos();
        this.sendingCurrentPedido = false;
      },
      error: () => {
        this.sendingCurrentPedido = false;
      }
    });
  }

  private groupPedidos(pedidos: ClientPedidoItem[]): GroupedPedidoItem[] {
    const grouped = new Map<string, GroupedPedidoItem>();

    for (const pedido of pedidos) {
      const key = `${pedido.numero}::${pedido.produto.id}`;
      const existing = grouped.get(key);

      if (existing) {
        existing.quantidade += pedido.quantidade;
        existing.subtotal += Number(pedido.produto.preco ?? 0) * pedido.quantidade;
        continue;
      }

      grouped.set(key, {
        ...pedido,
        quantidade: pedido.quantidade,
        subtotal: Number(pedido.produto.preco ?? 0) * pedido.quantidade
      });
    }

    return Array.from(grouped.values());
  }
}
