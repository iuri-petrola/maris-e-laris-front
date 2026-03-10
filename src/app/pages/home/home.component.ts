import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProdutoApiService, ProdutoItem } from '../../services/produto-api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  readonly destaque = {
    texto: 'Colecao nova com roupas e sapatos femininos para todas as ocasioes.',
    referencia: 'Maris e Laris'
  };

  destaqueImagemUrl: string | null = null;
  destaqueNome: string | null = null;
  private produtos: ProdutoItem[] = [];
  private dayChangeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly produtoApiService: ProdutoApiService) {}

  ngOnInit(): void {
    this.produtoApiService.getProdutos().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        this.setDestaqueDoDia();
        this.scheduleNextDayUpdate();
      },
      error: () => {
        this.destaqueImagemUrl = null;
        this.destaqueNome = null;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.dayChangeTimer) {
      clearTimeout(this.dayChangeTimer);
      this.dayChangeTimer = null;
    }
  }

  private getDaySeed(): number {
    const now = new Date();
    const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.floor(localMidnight.getTime() / 86400000);
  }

  private setDestaqueDoDia(): void {
    if (!this.produtos.length) {
      this.destaqueImagemUrl = null;
      this.destaqueNome = null;
      return;
    }

    const index = this.getDailyIndex(this.getDaySeed(), this.produtos.length);
    const item = this.produtos[index];
    this.destaqueImagemUrl = item.imagemUrl;
    this.destaqueNome = item.nome;
  }

  private getDailyIndex(seed: number, length: number): number {
    return seed % length;
  }

  private scheduleNextDayUpdate(): void {
    if (this.dayChangeTimer) {
      clearTimeout(this.dayChangeTimer);
    }

    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilTomorrow = tomorrow.getTime() - now.getTime();

    this.dayChangeTimer = setTimeout(() => {
      this.setDestaqueDoDia();
      this.scheduleNextDayUpdate();
    }, msUntilTomorrow);
  }
}
