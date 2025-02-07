import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStorageService } from '../services/storage/session-storage.service';

export const groupGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const sessionStorage = inject(SessionStorageService);
  let user = sessionStorage.getItem("User");

  const groupSelected: boolean = Array.isArray(user.groups) && user.groups.length > 0;


  if(!groupSelected){
    router.navigate(['group']);
  }

  return groupSelected;
};
