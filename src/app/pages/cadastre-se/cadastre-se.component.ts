import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientAuthService } from '../../services/client-auth.service';
import { ClientUserApiService } from '../../services/client-user-api.service';

type ContactType = 'Whats' | 'Insta' | 'TikTok';

@Component({
  selector: 'app-cadastre-se',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastre-se.component.html',
  styleUrls: ['./cadastre-se.component.scss']
})
export class CadastreSeComponent {
  nome = '';
  contato = 'Whats: ';
  contactType: ContactType = 'Whats';
  loading = false;
  errorMessage = '';

  constructor(
    private readonly clientUserApiService: ClientUserApiService,
    private readonly clientAuthService: ClientAuthService,
    private readonly router: Router
  ) {}

  get contatoPlaceholder(): string {
    if (this.contactType === 'Whats') {
      return 'Whats: (85) 99999-9999';
    }

    if (this.contactType === 'Insta') {
      return 'Insta: @seuinstagram';
    }

    return 'TikTok: @seutiktok';
  }

  setContactType(type: ContactType): void {
    this.contactType = type;
    this.contato = `${type}: `;
  }

  normalizeContatoInput(): void {
    const prefix = `${this.contactType}: `;

    if (!this.contato.startsWith(prefix)) {
      const rawValue = this.contato
        .replace(/^Whats:\s*/i, '')
        .replace(/^Insta:\s*/i, '')
        .replace(/^TikTok:\s*/i, '');

      this.contato = `${prefix}${rawValue}`;
    }
  }

  submit(): void {
    this.normalizeContatoInput();

    if (!this.nome.trim() || this.contato.trim() === `${this.contactType}:`) {
      this.errorMessage = 'Preencha nome e contato.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.clientUserApiService
      .register({
        nome: this.nome.trim(),
        contato: this.contato.trim()
      })
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.clientAuthService.setSession(response.token, response.nome);
          this.router.navigate(['/cliente']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error?.error?.error || 'Nao foi possivel concluir o cadastro.';
        }
      });
  }
}
