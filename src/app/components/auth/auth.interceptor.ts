import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@env/environment';
import { getCookie } from '@utils/csrf.util';

const EXCLUDE_WITH_CREDENTIALS = ['/api/auth/register']; // register doesn't need cookies

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBase = environment.apiBaseUrl;

  if (req.url.startsWith(apiBase)) {
    const path = req.url.substring(apiBase.length);
    const exclude = EXCLUDE_WITH_CREDENTIALS.some((p) => path.startsWith(p));

    // Only include credentials when needed (login/logout/secure calls)
    if (!exclude) {
      req = req.clone({ withCredentials: true });
    }

    // Add CSRF token for unsafe methods (if cookie exists)
    const unsafe = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (unsafe.includes(req.method)) {
      const csrf = getCookie('X-CSRF');
      if (csrf) {
        req = req.clone({ setHeaders: { 'X-CSRF': csrf } });
      }
    }
  }

  return next(req);
};
