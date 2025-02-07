import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth-service.service';
import { inject } from '@angular/core';


export const authGuardGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  let authenticated:boolean = false

  authService.isAuthenticated$.subscribe(auth => {
    authenticated = auth;
  });

  if (!authenticated) {
    router.navigate(['/login']);
  }

  return authenticated;

};
