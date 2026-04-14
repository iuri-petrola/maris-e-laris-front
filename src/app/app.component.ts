import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AdminAuthService } from './services/admin-auth.service';

type SocialLink = {
  name: string;
  href: string;
  label: string;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isAdminRoute = false;
  adminUsername: string | null = null;
  contatosOpen = false;

  readonly socialLinks: SocialLink[] = [
    { name: 'whatsapp', href: 'https://wa.me/5585996270455', label: 'WhatsApp' },
    { name: 'instagram', href: 'https://www.instagram.com/mariselarislojaonline/', label: 'Instagram' },
    { name: 'tiktok', href: 'https://www.tiktok.com/@mariselaris.loja', label: 'TikTok' }
  ];

  constructor(
    private readonly router: Router,
    private readonly adminAuthService: AdminAuthService
  ) {
    this.updateRouteState(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => this.updateRouteState((event as NavigationEnd).urlAfterRedirects));
  }

  toggleContatos(): void {
    this.contatosOpen = !this.contatosOpen;
  }

  closeContatos(): void {
    this.contatosOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeContatos();
  }

  private updateRouteState(url: string): void {
    this.isAdminRoute = url.startsWith('/admin');
    this.adminUsername = this.adminAuthService.getUsername();
    this.contatosOpen = false;
  }
}
