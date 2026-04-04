import { Component } from '@angular/core';
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

  readonly socialLinks: SocialLink[] = [
    { name: 'instagram', href: 'https://www.instagram.com/mariselarislojaonline/', label: 'Instagram' },
    { name: 'facebook', href: 'https://www.facebook.com/mariselaris', label: 'Facebook' },
    { name: 'tiktok', href: 'https://www.tiktok.com/@mariselaris.loja', label: 'TikTok' },
    { name: 'whatsapp', href: 'https://wa.me/5585996270455', label: 'WhatsApp' }
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

  private updateRouteState(url: string): void {
    this.isAdminRoute = url.startsWith('/admin');
    this.adminUsername = this.adminAuthService.getUsername();
  }
}
