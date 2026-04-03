import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

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

  readonly socialLinks: SocialLink[] = [
    { name: 'instagram', href: 'https://www.instagram.com/mariselarislojaonline/', label: 'Instagram' },
    { name: 'facebook', href: 'https://www.facebook.com/mariselaris', label: 'Facebook' },
    { name: 'tiktok', href: 'https://www.tiktok.com/@mariselaris.loja', label: 'TikTok' },
    { name: 'whatsapp', href: 'https://wa.me/5585996270455', label: 'WhatsApp' }
  ];

  constructor(private readonly router: Router) {
    this.updateAdminRoute(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => this.updateAdminRoute((event as NavigationEnd).urlAfterRedirects));
  }

  private updateAdminRoute(url: string): void {
    this.isAdminRoute = url.startsWith('/admin');
  }
}
