import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminPedidoApiService, AdminPedidoItem, PedidoStatus } from '../../services/admin-pedido-api.service';

type AdminPedidoGroupedProduto = {
  produtoId: number;
  nome: string;
  preco: number;
  imagemUrl: string;
  videoUrl: string | null;
  quantidade: number;
  subtotal: number;
};

type StatusFilter = 'TODOS' | PedidoStatus;

type AdminPedidoGrouped = {
  numero: string;
  status: PedidoStatus;
  contato: string;
  createdAt: string;
  clientUser: {
    id: number;
    nome: string;
    contato: string;
  };
  produtos: AdminPedidoGroupedProduto[];
  total: number;
};

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-pedidos.component.html',
  styleUrls: ['./admin-pedidos.component.scss']
})
export class AdminPedidosComponent implements OnInit {
  pedidos: AdminPedidoGrouped[] = [];
  loading = true;
  errorMessage = '';
  readonly statusOptions: PedidoStatus[] = ['PENDENTE_DE_ENVIO', 'ENVIADO', 'EM_ATENDIMENTO', 'FINALIZADO'];
  readonly statusFilterOptions: StatusFilter[] = ['TODOS', 'ENVIADO', 'EM_ATENDIMENTO', 'FINALIZADO'];
  readonly savingStatus: Record<string, boolean> = {};
  expandedPedidos = new Set<string>();
  selectedStatusFilter: StatusFilter = 'TODOS';

  constructor(
    private readonly pedidoApiService: AdminPedidoApiService,
    private readonly authService: AdminAuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadPedidos();
  }

  loadPedidos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.pedidoApiService.getPedidos().subscribe({
      next: (pedidos) => {
        const visiblePedidos = pedidos.filter((pedido) => pedido.status !== 'PENDENTE_DE_ENVIO');
        this.pedidos = this.groupPedidos(visiblePedidos);
        this.expandedPedidos = new Set<string>();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Nao foi possivel carregar os pedidos.';
        this.loading = false;
      }
    });
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

  get filteredPedidos(): AdminPedidoGrouped[] {
    if (this.selectedStatusFilter === 'TODOS') {
      return this.pedidos;
    }

    return this.pedidos.filter((pedido) => pedido.status === this.selectedStatusFilter);
  }

  get totalPedidos(): number {
    return this.pedidos.length;
  }

  get totalPedidosFiltrados(): number {
    return this.filteredPedidos.length;
  }

  updateStatus(numero: string, status: string): void {
    const normalized = status as PedidoStatus;
    this.savingStatus[numero] = true;
    this.errorMessage = '';

    this.pedidoApiService.updateStatus(numero, normalized).subscribe({
      next: () => {
        this.pedidos = this.pedidos.map((pedido) =>
          pedido.numero === numero ? { ...pedido, status: normalized } : pedido
        );
        this.savingStatus[numero] = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.error || 'Nao foi possivel atualizar o status do pedido.';
        this.savingStatus[numero] = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }

  formatPrice(value: number | null | undefined): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value ?? 0));
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(value));
  }


  formatStatus(status: PedidoStatus): string {
    if (status === 'PENDENTE_DE_ENVIO') {
      return 'Pendente de envio';
    }

    if (status === 'EM_ATENDIMENTO') {
      return 'Em atendimento';
    }

    if (status === 'FINALIZADO') {
      return 'Finalizado';
    }

    return 'Enviado';
  }

  private groupPedidos(items: AdminPedidoItem[]): AdminPedidoGrouped[] {
    const pedidosMap = new Map<string, AdminPedidoGrouped>();

    for (const item of items) {
      const existingPedido = pedidosMap.get(item.numero);

      if (!existingPedido) {
        pedidosMap.set(item.numero, {
          numero: item.numero,
          status: item.status,
          contato: item.contato,
          createdAt: item.createdAt,
          clientUser: item.clientUser,
          produtos: [{
            produtoId: item.produto.id,
            nome: item.produto.nome,
            preco: item.produto.preco,
            imagemUrl: item.produto.imagemUrl,
            videoUrl: item.produto.videoUrl,
            quantidade: item.quantidade,
            subtotal: Number(item.produto.preco ?? 0) * item.quantidade
          }],
          total: Number(item.produto.preco ?? 0) * item.quantidade
        });
        continue;
      }

      const existingProduto = existingPedido.produtos.find((produto) => produto.produtoId === item.produto.id);

      if (existingProduto) {
        existingProduto.quantidade += item.quantidade;
        existingProduto.subtotal += Number(item.produto.preco ?? 0) * item.quantidade;
      } else {
        existingPedido.produtos.push({
          produtoId: item.produto.id,
          nome: item.produto.nome,
          preco: item.produto.preco,
          imagemUrl: item.produto.imagemUrl,
          videoUrl: item.produto.videoUrl,
          quantidade: item.quantidade,
          subtotal: Number(item.produto.preco ?? 0) * item.quantidade
        });
      }

      existingPedido.total += Number(item.produto.preco ?? 0) * item.quantidade;
    }

    return Array.from(pedidosMap.values());
  }
}
