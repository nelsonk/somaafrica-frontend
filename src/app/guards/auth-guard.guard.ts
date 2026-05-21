import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth-service.service';
import { inject } from '@angular/core';
import { SessionStorageService } from '../services/storage/session-storage.service';


export const authGuardGuard: CanActivateFn = (route, state) => {
  const sessionStorage = inject(SessionStorageService);

  let isAuthenticated = sessionStorage.getItem("isAuthenticated");

  return isAuthenticated
};
