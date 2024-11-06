import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timer, switchMap, of, catchError, Observable, BehaviorSubject, Timestamp } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiHealthService {
  apiUrl: string = "http://localhost:8000/api/health";
  isHealthSubject = new BehaviorSubject<boolean>(false)
  isHealthy$ = this.isHealthSubject.asObservable();

  constructor(private httpClient: HttpClient) {
    this.checkApiHealthPeriodically();
  }

  private checkApiHealthPeriodically() {
    timer(0, 10000) // Start immediately, then every 60 seconds
      .pipe(
        switchMap(() => this.checkApiHealth())
      )
      .subscribe(isHealthy => this.isHealthSubject.next(isHealthy));
  }

  checkApiHealth(): Observable<boolean> {
    return this.httpClient.get<{ status: string, time: string }>(this.apiUrl).pipe(
      switchMap(response => {
        console.log(`API Health status: ${response.status}, Server time: ${response.time}`)
        return of(response.status === "healthy")
      }),
      catchError(error => {
        console.log("Error connecting to API", error);
        return of(false); // Set isHealthy to false if there's an error
      })
    );
  }

}
