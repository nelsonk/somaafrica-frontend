import { Injectable, inject } from '@angular/core';
import { SessionStorageService } from '../storage/session-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthHeaderService {
  sessionStorage = inject(SessionStorageService);

  getHeaders() {

    // const token = localStorage.getItem('access_token');
    const token = this.sessionStorage.getItem('Token')?.access;

    return {
      Authorization: `Bearer ${token}`
    };
  }
}