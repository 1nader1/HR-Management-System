import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

 if (req.url.includes('/assets/i18n/') || req.url.includes('/api/Auth/')) {
    return next(req);
  }

  const localToken = localStorage.getItem('token');
  let finalRequest = req;

  if (localToken) {
    finalRequest = req.clone({
      setHeaders: { Authorization: `Bearer ${localToken}` }
    });
  }

  return next(finalRequest).pipe(
    catchError((error: HttpErrorResponse) => {

      console.error(`[Interceptor Report] API: ${req.url} | Status: ${error.status}`);

      if (error.status === 401) {
        console.log('🚨 تم اصطياد 401 من السيرفر، جاري مسح التوكن والطرد لصفحة الدخول...');
        authService.logout();
        router.navigate(['/login']);
      }
      
      return throwError(() => error);
    })
  );
};