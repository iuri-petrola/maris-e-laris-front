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
  password = '';
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
      this.successMessage = 'Cadastro realizado com sucesso. Entre com seu nome e senha.';
    }
  }

  submit(): void {
    if (!this.nome.trim() || !this.password) {
      this.errorMessage = 'Informe nome e senha.';
      this.successMessage = '';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.clientAuthService.login(this.nome.trim(), this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/cliente']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.error || 'Nao foi possivel entrar.';
      }
    });
  }
}
