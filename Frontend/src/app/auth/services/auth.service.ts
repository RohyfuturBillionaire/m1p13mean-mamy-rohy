import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environments';

// auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessToken: string | null = null; // Store in memory only!
  private apiUrl= `${environment.apiUrl}/sitecrm`;
  
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password }, { withCredentials: true })
      .pipe(tap(response => {
        this.accessToken = response.accessToken; // Store access token in memory
      }));
  }

  refreshToken(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/refresh`, {}, { withCredentials: true })
      .pipe(tap(response => {
        this.accessToken = response.accessToken;
      }));
  }

  logout(): Observable<any> {
    this.accessToken = null;
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true });
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}