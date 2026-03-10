import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProdutoApiService } from '../../services/produto-api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  readonly destaque = {
    texto: 'Colecao nova com roupas e sapatos femininos para todas as ocasioes.',
    referencia: 'Maris e Laris'
  };

  destaqueImagemUrl: string | null = null;
  destaqueNome: string | null = null;

  constructor(private readonly produtoApiService: ProdutoApiService) {}

  ngOnInit(): void {
    this.produtoApiService.getProdutos().subscribe({
      next: (produtos) => {
        if (!produtos.length) return;

        const daySeed = this.getDaySeed();
        const index = this.getDailyIndex(daySeed, produtos.length);
        const item = produtos[index];

        this.destaqueImagemUrl = item.imagemUrl;
        this.destaqueNome = item.nome;
      },
      error: () => {
        this.destaqueImagemUrl = null;
        this.destaqueNome = null;
      }
    });
  }

  private getDaySeed(): number {
    const now = new Date();
    return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  }

  private getDailyIndex(seed: number, length: number): number {
    const hash = (seed * 1103515245 + 12345) & 0x7fffffff;
    return hash % length;
  }
}
