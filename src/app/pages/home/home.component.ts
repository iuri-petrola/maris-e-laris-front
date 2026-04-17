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
    texto: 'Novas coleções para todas as ocasiões.',
    referencia: 'Maris e Laris'
  };
  readonly bannerDesktopImageUrl = '/assets/banner-desktop.png';
  readonly bannerMobileImageUrl = '/assets/banner-mobile.png';

  destaqueImagemUrl: string | null = null;
  destaqueNome: string | null = null;
  private produtos: ProdutoItem[] = [];
  private dayChangeTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly destaqueStoragePrefix = 'maris-laris:destaque-dia:';

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

    const seed = this.getDaySeed();
    const storageKey = `${this.destaqueStoragePrefix}${seed}`;
    const savedId = Number(localStorage.getItem(storageKey));
    const savedItem = this.produtos.find((produto) => produto.id === savedId);

    const item =
      savedItem ??
      this.produtos[this.getDailyIndex(seed, this.produtos.length)];

    if (!savedItem) {
      localStorage.setItem(storageKey, String(item.id));
    }

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
