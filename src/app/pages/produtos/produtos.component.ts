import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProdutoApiService, ProdutoItem } from '../../services/produto-api.service';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.scss']
})
export class ProdutosComponent implements OnInit {
  produtos: ProdutoItem[] = [];
  loading = true;
  errorMessage = '';

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

}
