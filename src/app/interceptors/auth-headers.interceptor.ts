import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth-service.service';
import { SessionStorageService } from '../services/storage/session-storage.service';
import { BYPASS_AUTH_TOKEN } from '../utils/http-context-tokens';

export const authHeadersInterceptorFn: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const sessionStorage = inject(SessionStorageService); // Inject the dependency dynamically
  const authService = inject(AuthService);

  if (req.context.get(BYPASS_AUTH_TOKEN)) {
    return next(req);
  }

  // Add Bearer Token
  const token = sessionStorage.getItem('Token')?.access;
  const clonedRequest = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && sessionStorage.getItem('Token')?.refresh) {
        // Try to refresh the token
        return authService.refreshToken().pipe(
          switchMap((newToken: { access: string; refresh: string }) => {
            // Save new token
            sessionStorage.setItem('Token', newToken);

            // Retry the original request with new token
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken.access}`,
              },
            });

            return next(retryReq);
          }),
          catchError(refreshError => {
            // Token refresh failed — log out user
            authService.logout(); // Implement logout in your AuthService
            return throwError(() => refreshError);
          })
        );
      }

      // Not a 401 or no refresh token available
      return throwError(() => error);
    })
  );
};
