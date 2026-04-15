import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClientAuthService, ClientProfile } from '../../services/client-auth.service';

@Component({
  selector: 'app-cliente-area',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cliente-area.component.html',
  styleUrls: ['./cliente-area.component.scss']
})
export class ClienteAreaComponent implements OnInit {
  loading = true;
  errorMessage = '';
  profile: ClientProfile | null = null;

  constructor(
    private readonly clientAuthService: ClientAuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.clientAuthService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.error || 'Nao foi possivel carregar sua area.';
      }
    });
  }

  logout(): void {
    this.clientAuthService.logout();
    this.router.navigate(['/login']);
  }
}
