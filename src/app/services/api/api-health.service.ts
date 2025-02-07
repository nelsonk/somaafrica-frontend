import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timer, switchMap, of, catchError, Observable, BehaviorSubject } from 'rxjs';
import { HttpContextToken, HttpContext } from '@angular/common/http';
import { BYPASS_INTERCEPTOR } from '../../utils/http-context-tokens';

@Injectable({
  providedIn: 'root'
})
export class ApiHealthService {
  apiUrl: string = "http://localhost:8000/api/health";
  isHealthSubject = new BehaviorSubject<boolean>(false)
  isHealthy$ = this.isHealthSubject.asObservable();
  options = {
        context: new HttpContext().set(BYPASS_INTERCEPTOR, true),
      };

  constructor(private httpClient: HttpClient) {
    this.checkApiHealthPeriodically();
  }

  private checkApiHealthPeriodically() {
    timer(0, 60000) // Start immediately, then every 60 seconds
      .pipe(
        switchMap(() => this.checkApiHealth())
      )
      .subscribe(isHealthy => this.isHealthSubject.next(isHealthy));
  }

  checkApiHealth(): Observable<boolean> {
    return this.httpClient.get<{ status: string, time: string }>(this.apiUrl, this.options).pipe(
      switchMap(response => {
        return of(response.status === "healthy");
      }),
      catchError(error => {
        return of(false); // Set isHealthy to false if there's an error
      })
    );
  }

}
