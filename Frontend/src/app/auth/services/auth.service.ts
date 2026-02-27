import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessToken: string | null = null;
  private userRole:string| null = null;
  private apiUrl = `${environment.apiUrl}/auth`;

  private userSignal = signal<any>(null);
  isAuthenticated = computed(() => {
    const user = this.userSignal();
    return !!this.accessToken || !!user;
  });
  currentUser = computed(() => this.userSignal());

  constructor(private http: HttpClient) {
    // Restore token from localStorage on app init (survives page refresh)
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData?.accessToken) {
        this.accessToken = userData.accessToken;
        this.userSignal.set(userData?.user || null);
      }
    } catch {}
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }, { withCredentials: true })
      .pipe(tap(response => {
        this.accessToken = response.accessToken;
        this.userSignal.set(response.user || null);
      }));
  }

  register(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, user, { withCredentials: true }).pipe(tap(response => {
      this.accessToken = response.accessToken;
      this.userSignal.set(response.user || null);
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
    this.userSignal.set(null);
    localStorage.removeItem('user');
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getUserRole(): string {
    return (this.userSignal()?.role || '').toLowerCase();
  }
}
