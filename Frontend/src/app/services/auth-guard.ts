import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const localToken = localStorage.getItem('token');

  if (localToken && localToken.trim() !== '') {
    return true; 
  } else {

    alert('عفواً، يجب عليك تسجيل الدخول أولاً أو حسابك لا يملك صلاحية!');
    authService.logout(); 
    router.navigate(['/login']);
    return false;
  }
};