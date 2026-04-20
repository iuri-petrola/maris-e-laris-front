import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ClientAuthService } from '../services/client-auth.service';

export const clientGuestGuard: CanActivateFn = () => {
  const authService = inject(ClientAuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/cliente/carrinho']);
};
