import { HttpInterceptorFn } from '@angular/common/http';
import { HttpStatusCode } from '@angular/common/http';
import { catchError, retry, timeout, map, of } from 'rxjs';
import { RETRY_COUNT, REQUEST_TIMEOUT } from '../utils/http-context-tokens';
import { STATUS_TYPE } from '../utils/status-type';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth-service.service';
import { SessionStorageService } from '../services/storage/session-storage.service';


export const retryTimeoutInterceptor: HttpInterceptorFn = (req, next) => {
  const RETRIES = req.context.get(RETRY_COUNT);
  const REQ_TIMEOUT = req.context.get(REQUEST_TIMEOUT);

  const auth = inject(AuthService);
  const storage = inject(SessionStorageService);

  return next(req).pipe(
    retry(RETRIES),
    timeout(REQ_TIMEOUT),
    map((response) => response),
    catchError((err) => {
      if(err.error?.status == HttpStatusCode.Unauthorized){
        auth.logout();
      }

      return of({ ...err.error, status: STATUS_TYPE.ERROR })
    })
  );
};
