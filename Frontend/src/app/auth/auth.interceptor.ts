import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./services/auth.service";
import { catchError, Observable, switchMap, throwError, BehaviorSubject, filter, take } from "rxjs";

// auth.interceptor.ts
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip interceptor for auth routes
    if (req.url.includes('/auth/')) {
      return next.handle(req);
    }

    const token = this.authService.getAccessToken();

    // If no token, try to refresh first
    if (!token) {
      return this.handleTokenRefresh(req, next);
    }

    // Add token to request
    const authReq = this.addToken(req, token);

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          return this.handleTokenRefresh(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  private handleTokenRefresh(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((response) => {
          this.isRefreshing = false;
          const newToken = this.authService.getAccessToken();
          this.refreshTokenSubject.next(newToken);
          return next.handle(this.addToken(req, newToken!));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          // Refresh failed - user needs to login again
          this.authService.logout().subscribe();
          return throwError(() => error);
        })
      );
    } else {
      // Wait for the refresh to complete
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next.handle(this.addToken(req, token!)))
      );
    }
  }
}