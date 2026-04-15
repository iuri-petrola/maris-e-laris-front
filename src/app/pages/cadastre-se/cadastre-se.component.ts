import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientUserApiService } from '../../services/client-user-api.service';

@Component({
  selector: 'app-cadastre-se',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastre-se.component.html',
  styleUrls: ['./cadastre-se.component.scss']
})
export class CadastreSeComponent {
  nome = '';
  email = '';
  whatsapp = '';
  senha = '';
  confirmarSenha = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly clientUserApiService: ClientUserApiService,
    private readonly router: Router
  ) {}

  submit(): void {
    if (!this.nome.trim() || !this.email.trim() || !this.whatsapp.trim() || !this.senha || !this.confirmarSenha) {
      this.errorMessage = 'Preencha nome, e-mail, whatsapp, senha e confirmacao de senha.';
      this.successMessage = '';
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      this.errorMessage = 'A confirmacao de senha nao confere.';
      this.successMessage = '';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.clientUserApiService
      .register({
        nome: this.nome.trim(),
        email: this.email.trim(),
        whatsapp: this.whatsapp.trim(),
        senha: this.senha
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Cadastro realizado com sucesso.';
          this.nome = '';
          this.email = '';
          this.whatsapp = '';
          this.senha = '';
          this.confirmarSenha = '';
          this.router.navigate(['/login'], {
            queryParams: { message: 'signup-success' }
          });
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error?.error?.error || 'Nao foi possivel concluir o cadastro.';
        }
      });
  }
}
