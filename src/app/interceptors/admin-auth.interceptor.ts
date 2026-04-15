import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AdminAuthService } from '../services/admin-auth.service';
import { ClientAuthService } from '../services/client-auth.service';

export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AdminAuthService);
  const clientAuthService = inject(ClientAuthService);
  const router = inject(Router);
  const adminToken = authService.getToken();
  const clientToken = clientAuthService.getToken();
  const isAdminRequest = req.url.includes('/admin/') || /\/produtos(?:\/\d+(?:\/[a-z-]+)?)?$/.test(req.url);
  const isClientRequest = req.url.includes('/client/me');

  let authReq = req;

  if (adminToken && isAdminRequest) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${adminToken}`
      }
    });
  }

  if (clientToken && isClientRequest) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${clientToken}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && authService.isAuthenticated() && isAdminRequest) {
        authService.logout();
        router.navigate(['/admin/login'], {
          queryParams: { reason: 'session-expired' }
        });
      }

      if (error.status === 401 && clientAuthService.isAuthenticated() && isClientRequest) {
        clientAuthService.logout();
        router.navigate(['/login'], {
          queryParams: { reason: 'session-expired' }
        });
      }

      return throwError(() => error);
    })
  );
};
