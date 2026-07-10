import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../environments/environment';
import { AdminAuthService } from './services/admin-auth.service';
import { ClientAuthService } from './services/client-auth.service';
import { CurrentPedidoService } from './services/current-pedido.service';

type SocialLink = {
  name: string;
  href: string;
  label: string;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isAdminRoute = false;
  adminUsername: string | null = null;
  clientNome: string | null = null;
  contatosOpen = false;
  clientLoginOpen = false;
  clientLoginLoading = false;
  clientLoginError = '';
  loginNome = '';
  loginContato = '';

  readonly socialLinks: SocialLink[] = environment.socialLinks;
  readonly whatsappLink = this.socialLinks.find((social) => social.name === 'whatsapp') ?? null;

  constructor(
    private readonly router: Router,
    private readonly adminAuthService: AdminAuthService,
    private readonly clientAuthService: ClientAuthService,
    private readonly currentPedidoService: CurrentPedidoService
  ) {
    this.updateRouteState(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => this.updateRouteState((event as NavigationEnd).urlAfterRedirects));

    this.clientAuthService.clientNome$.subscribe((nome) => {
      this.clientNome = nome;
    });
  }

  toggleContatos(): void {
    this.contatosOpen = !this.contatosOpen;
  }

  openClientLogin(): void {
    this.clientLoginOpen = true;
    this.clientLoginLoading = false;
    this.clientLoginError = '';
    this.loginNome = '';
    this.loginContato = '';
  }

  closeClientLogin(): void {
    this.clientLoginOpen = false;
    this.clientLoginLoading = false;
    this.clientLoginError = '';
  }

  submitClientLogin(): void {
    const nome = this.loginNome.trim();
    const contato = this.loginContato.trim();

    if (!nome || !contato) {
      this.clientLoginError = 'Preencha nome e contato.';
      return;
    }

    this.clientLoginLoading = true;
    this.clientLoginError = '';

    this.clientAuthService.loginByContact(nome, contato).subscribe({
      next: () => {
        this.clientLoginLoading = false;
        this.closeClientLogin();
        this.router.navigate(['/cliente/carrinho']);
      },
      error: (error) => {
        this.clientLoginLoading = false;
        this.clientLoginError = error?.error?.error || 'Nao foi possivel entrar.';
      }
    });
  }

  closeContatos(): void {
    this.contatosOpen = false;
  }


  getClientDisplayName(): string {
    const nome = (this.clientNome || '').trim();

    if (!nome) {
      return '';
    }

    const parts = nome.split(/\s+/).filter(Boolean);

    if (parts.length <= 1) {
      return parts[0] || '';
    }

    return `${parts[0]} ${parts[parts.length - 1]}`;
  }

  logoutClient(): void {
    this.clientAuthService.logout();
    this.currentPedidoService.clear();
    this.router.navigate(['/produtos']);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeContatos();
  }

  private updateRouteState(url: string): void {
    this.isAdminRoute = url.startsWith('/admin');
    this.adminUsername = this.adminAuthService.getUsername();
    this.clientNome = this.clientAuthService.getNome();
    this.contatosOpen = false;
  }
}
