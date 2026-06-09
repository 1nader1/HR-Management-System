import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  
  if (req.url.includes('/assets/i18n/')) {
    return next(req); 
  }

  const localToken = localStorage.getItem('token');

  if (localToken) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${localToken}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};