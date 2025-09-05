import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { ToasterService } from './toaster.service';

export const toastInterceptor = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const toaster = inject(ToasterService);

  // Opt-in success toast per call
  const wantsSuccessToast = req.headers.get('x-show-success') === '1';
  const successMsg =
    req.headers.get('x-success-message') || 'Completed successfully';

  return next(req).pipe(
    tap((evt) => {
      if (evt instanceof HttpResponse) {
        const isMutating = /POST|PUT|PATCH|DELETE/i.test(req.method);
        if (wantsSuccessToast && isMutating) toaster.success(successMsg);
      }
    }),
    catchError((err: unknown) => {
      let message = 'Something went wrong.';
      if (err instanceof HttpErrorResponse) {
        if (err.status === 0) {
          message = 'Network error: Unable to reach the server.';
        } else {
          const b = err.error;
          const fromBody =
            (typeof b === 'string' && b) ||
            b?.message ||
            b?.error?.message ||
            (Array.isArray(b?.errors) ? b.errors.join(', ') : undefined) ||
            b?.title;
          message =
            fromBody || `HTTP ${err.status}: ${err.statusText || 'Error'}`;
        }
      } else {
        message = (err as any)?.message || message;
      }
      toaster.error(message);
      return throwError(() => err);
    })
  );
};
