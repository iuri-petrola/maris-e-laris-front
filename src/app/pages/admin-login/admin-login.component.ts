import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  username = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private readonly authService: AdminAuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    const reason = this.route.snapshot.queryParamMap.get('reason');

    if (reason === 'session-expired') {
      this.errorMessage = 'Sessao expirada. Entre novamente.';
    }
  }

  submit(): void {
    if (!this.username.trim() || !this.password) {
      this.errorMessage = 'Informe usuario e senha.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.username.trim(), this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin/produtos']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.error || 'Nao foi possivel entrar.';
      }
    });
  }
}
