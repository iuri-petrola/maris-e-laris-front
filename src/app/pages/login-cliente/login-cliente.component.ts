import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientAuthService } from '../../services/client-auth.service';

@Component({
  selector: 'app-login-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login-cliente.component.html',
  styleUrls: ['./login-cliente.component.scss']
})
export class LoginClienteComponent {
  nome = '';
  contato = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly clientAuthService: ClientAuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    const message = this.route.snapshot.queryParamMap.get('message');

    if (message === 'signup-success') {
      this.successMessage = 'Cadastro realizado com sucesso. Entre com seu nome e contato.';
    }
  }

  submit(): void {
    if (!this.nome.trim() || !this.contato.trim()) {
      this.errorMessage = 'Informe nome e contato.';
      this.successMessage = '';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.clientAuthService.login(this.nome.trim(), this.contato.trim()).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/cliente/carrinho']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.error || 'Nao foi possivel entrar.';
      }
    });
  }
}
