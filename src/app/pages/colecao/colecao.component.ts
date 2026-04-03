import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProdutoApiService, ProdutoItem } from '../../services/produto-api.service';

@Component({
  selector: 'app-colecao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './colecao.component.html',
  styleUrls: ['./colecao.component.scss']
})
export class ColecaoComponent implements OnInit {
  produtos: ProdutoItem[] = [];
  loading = true;
  errorMessage = '';
  private readonly whatsappNumber = '5585996270455';

  constructor(private readonly produtoApiService: ProdutoApiService) {}

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

  getCompraUrl(item: ProdutoItem): string {
    const message = [
      'Ola, tenho interesse neste produto:',
      item.nome,
      `Preco: ${this.formatPrice(item.preco)}`,
      `Imagem: ${item.imagemUrl}`
    ].join('\n');

    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }
}
