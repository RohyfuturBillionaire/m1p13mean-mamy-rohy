import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class FavoriteApiService {
  private apiUrl = `${environment.apiUrl}/api/favorites`;

  constructor(private http: HttpClient) {}

  getFavorites(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addFavorite(articleId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${articleId}`, {});
  }

  removeFavorite(articleId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${articleId}`);
  }
}
