import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpContext } from '@angular/common/http';
import { RETRY_COUNT, REQUEST_TIMEOUT, BYPASS_AUTH_TOKEN } from '../../utils/http-context-tokens';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  /* if any missing, use defaults, if whole object missing, use {} */
  buildOptions({
    retry=3,
    timeout=30000,
    bypass=false
  }: {
    retry?: number,
    timeout?: number,
    bypass?: boolean
  } = {}){
    return {
      context: new HttpContext()
        .set(RETRY_COUNT, retry)
        .set(REQUEST_TIMEOUT, timeout)
        .set(BYPASS_AUTH_TOKEN, bypass)
    }
  }

  get<T>(url: string, config?: any) {
    return this.http.get<T>(url, this.buildOptions(config));
  }

  post<T>(url: string, body: any, config?: any) {
    return this.http.post<T>(url, body, this.buildOptions(config));
  }

  put<T>(url: string, body: any, config?: any) {
    return this.http.put<T>(url, body, this.buildOptions(config));
  }

  patch<T>(url: string, body: any, config?: any) {
    return this.http.patch<T>(url, body, this.buildOptions(config));
  }

  delete<T>(url: string, config?: any) {
    return this.http.delete<T>(url, this.buildOptions(config));
  }
}
