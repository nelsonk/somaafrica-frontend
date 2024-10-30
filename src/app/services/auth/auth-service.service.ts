import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
    return this.httpClient.post(`${this.baseUrl}/login`, data);
  }

  register(data: {}){
    return this.httpClient.post(`${this.baseUrl}/signup`, data);
  }
}
