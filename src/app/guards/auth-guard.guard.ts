import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth-service.service';
import { inject } from '@angular/core';

export const authGuardGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const authenticated: boolean = authService.isAuthenticated();

  if (!authenticated) {
    console.log("authenticated is ", authenticated)
    inject(Router).navigate(['/login']);
    return false;
  }

  return authenticated;
};
