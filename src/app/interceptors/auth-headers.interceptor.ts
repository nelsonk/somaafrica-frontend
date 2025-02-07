import { HttpContextToken, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { SessionStorageService } from '../services/storage/session-storage.service';
import { BYPASS_INTERCEPTOR } from '../utils/http-context-tokens';

export const authHeadersInterceptorFn: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const sessionStorage = inject(SessionStorageService); // Inject the dependency dynamically

  if (req.context.get(BYPASS_INTERCEPTOR)) {
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

  return next(clonedRequest)
};
