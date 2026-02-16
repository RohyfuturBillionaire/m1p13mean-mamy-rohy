import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessToken: string | null = null;
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }, { withCredentials: true })
      .pipe(tap(response => {
        this.accessToken = response.accessToken;
      }));
  }

  register(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, user, { withCredentials: true }).pipe(tap(response => {
      this.accessToken = response.accessToken;
    }));
  }

  refreshToken(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/refresh`, {}, { withCredentials: true })
      .pipe(tap(response => {
        this.accessToken = response.accessToken;
      }));
  }

  logout(): Observable<any> {
    this.accessToken = null;
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}
