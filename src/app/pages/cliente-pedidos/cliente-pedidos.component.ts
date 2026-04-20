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

type PedidoGroup = {
  numero: string;
  status: string;
  contato: string;
  createdAt: string;
  itens: GroupedPedidoItem[];
  total: number;
};

@Component({
  selector: 'app-cliente-pedidos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cliente-pedidos.component.html',
  styleUrls: ['./cliente-pedidos.component.scss']
})
export class ClientePedidosComponent implements OnInit {
  loading = true;
  errorMessage = '';
  pedidos: PedidoGroup[] = [];
  expandedPedidos = new Set<string>();

  constructor(
    private readonly clientAuthService: ClientAuthService,
    private readonly clientPedidoService: ClientPedidoService,
    private readonly currentPedidoService: CurrentPedidoService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadPedidos();
  }

  loadPedidos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.clientPedidoService.getPedidos().subscribe({
      next: (pedidos) => {
        const filtered = pedidos.filter((pedido) => pedido.status !== 'PENDENTE_DE_ENVIO');
        this.pedidos = this.groupPedidos(filtered);
        this.expandedPedidos = new Set<string>();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.error || 'Nao foi possivel carregar os pedidos.';
      }
    });
  }

  logout(): void {
    this.clientAuthService.logout();
    this.currentPedidoService.clear();
    this.router.navigate(['/produtos']);
  }

  formatPrice(value: number | null | undefined): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value ?? 0));
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
  }


  togglePedido(numero: string): void {
    if (this.expandedPedidos.has(numero)) {
      this.expandedPedidos.delete(numero);
      return;
    }

    this.expandedPedidos.add(numero);
  }

  isPedidoExpanded(numero: string): boolean {
    return this.expandedPedidos.has(numero);
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

  private groupPedidos(items: ClientPedidoItem[]): PedidoGroup[] {
    const pedidosMap = new Map<string, PedidoGroup>();

    for (const item of items) {
      const existingPedido = pedidosMap.get(item.numero);
      if (!existingPedido) {
        pedidosMap.set(item.numero, {
          numero: item.numero,
          status: item.status,
          contato: item.contato,
          createdAt: item.createdAt,
          itens: [{ ...item, quantidade: item.quantidade, subtotal: Number(item.produto.preco ?? 0) * item.quantidade }],
          total: Number(item.produto.preco ?? 0) * item.quantidade
        });
        continue;
      }

      const existingItem = existingPedido.itens.find((pedido) => pedido.produto.id === item.produto.id);
      if (existingItem) {
        existingItem.quantidade += item.quantidade;
        existingItem.subtotal += Number(item.produto.preco ?? 0) * item.quantidade;
      } else {
        existingPedido.itens.push({ ...item, quantidade: item.quantidade, subtotal: Number(item.produto.preco ?? 0) * item.quantidade });
      }
      existingPedido.total += Number(item.produto.preco ?? 0) * item.quantidade;
    }

    return Array.from(pedidosMap.values());
  }
}
