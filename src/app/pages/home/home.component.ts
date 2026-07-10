import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProdutoApiService, ProdutoItem } from '../../services/produto-api.service';

type HomeBannerItem = {
  desktopImageUrl: string;
  mobileImageUrl: string;
  alt: string;
  fit: 'cover' | 'contain';
};

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
  readonly fallbackBanners: HomeBannerItem[] = [
    {
      desktopImageUrl: '/assets/banner-desktop.png',
      mobileImageUrl: '/assets/banner-mobile.png',
      alt: 'Banner principal Maris e Laris',
      fit: 'cover'
    }
  ];
  banners: HomeBannerItem[] = [...this.fallbackBanners];
  currentBannerIndex = 0;

  destaqueImagemUrl: string | null = null;
  destaqueNome: string | null = null;
  private produtos: ProdutoItem[] = [];
  private dayChangeTimer: ReturnType<typeof setTimeout> | null = null;
  private bannerRotationTimer: ReturnType<typeof setInterval> | null = null;
  private readonly destaqueStoragePrefix = 'maris-laris:destaque-dia:';
  private readonly bannerRotationMs = 5000;

  constructor(private readonly produtoApiService: ProdutoApiService) {}

  ngOnInit(): void {
    this.startBannerRotation();

    this.produtoApiService.getProdutos().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        this.banners = this.buildProductBanners(produtos);
        this.currentBannerIndex = 0;
        this.restartBannerRotation();
        this.setDestaqueDoDia();
        this.scheduleNextDayUpdate();
      },
      error: () => {
        this.banners = [...this.fallbackBanners];
        this.currentBannerIndex = 0;
        this.restartBannerRotation();
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

    this.stopBannerRotation();
  }

  get currentBanner() {
    return this.banners[this.currentBannerIndex];
  }

  showPreviousBanner(): void {
    this.currentBannerIndex =
      (this.currentBannerIndex - 1 + this.banners.length) % this.banners.length;
    this.restartBannerRotation();
  }

  showNextBanner(): void {
    this.currentBannerIndex = (this.currentBannerIndex + 1) % this.banners.length;
    this.restartBannerRotation();
  }

  setCurrentBanner(index: number): void {
    if (index === this.currentBannerIndex) {
      return;
    }

    this.currentBannerIndex = index;
    this.restartBannerRotation();
  }

  pauseBannerRotation(): void {
    this.stopBannerRotation();
  }

  resumeBannerRotation(): void {
    this.startBannerRotation();
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

  private buildProductBanners(produtos: ProdutoItem[]): HomeBannerItem[] {
    const productBanners: HomeBannerItem[] = produtos
      .filter((produto) => !!produto.imagemUrl)
      .slice(0, 5)
      .map((produto) => ({
        desktopImageUrl: produto.imagemUrl,
        mobileImageUrl: produto.imagemUrl,
        alt: produto.nome ? `Produto ${produto.nome}` : 'Banner principal Maris e Laris',
        fit: 'contain'
      }));

    return productBanners.length ? productBanners : [...this.fallbackBanners];
  }

  private startBannerRotation(): void {
    if (this.bannerRotationTimer || this.banners.length <= 1) {
      return;
    }

    this.bannerRotationTimer = setInterval(() => {
      this.currentBannerIndex = (this.currentBannerIndex + 1) % this.banners.length;
    }, this.bannerRotationMs);
  }

  private stopBannerRotation(): void {
    if (!this.bannerRotationTimer) {
      return;
    }

    clearInterval(this.bannerRotationTimer);
    this.bannerRotationTimer = null;
  }

  private restartBannerRotation(): void {
    this.stopBannerRotation();
    this.startBannerRotation();
  }
}
