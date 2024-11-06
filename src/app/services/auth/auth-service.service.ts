import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, retry, timeout, of } from 'rxjs';
import { STATUS_TYPE } from '../../pre-login/login/login.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = "http://localhost:8000";

  isAuthenticated(): boolean {
    return false;
  }

  constructor(private httpClient: HttpClient) { }

  login(data: {}){
    return this.httpClient.post(`${this.baseUrl}/login`, data)
      .pipe(
        timeout(30000),
        retry(3),
        map((response) => response),
        catchError((err) => {
          return of({ ...err.error, status: STATUS_TYPE.ERROR })
        })
      )
  }

  register(data: {}){
    return this.httpClient.post(`${this.baseUrl}/signup`, data);
  }
}
