import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AdminAuthService } from '../services/admin-auth.service';

export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AdminAuthService);
  const router = inject(Router);
  const token = authService.getToken();
  const isAdminRequest = req.url.includes('/admin/') || /\/produtos(?:\/\d+(?:\/[a-z-]+)?)?$/.test(req.url);

  const authReq = token && isAdminRequest
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && authService.isAuthenticated()) {
        authService.logout();
        router.navigate(['/admin/login'], {
          queryParams: { reason: 'session-expired' }
        });
      }

      return throwError(() => error);
    })
  );
};
