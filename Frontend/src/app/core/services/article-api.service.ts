import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class ArticleApiService {
  private apiUrl = `${environment.apiUrl}/articles`;

  constructor(private http: HttpClient) {}

  // Articles
  getArticles(boutiqueId?: string): Observable<any[]> {
    const params = boutiqueId ? `?boutique=${boutiqueId}` : '';
    return this.http.get<any[]>(`${this.apiUrl}${params}`);
  }

  getArticle(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createArticle(data: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateArticle(id: string, data: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteArticle(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  toggleArticle(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/toggle`, {});
  }

  // Categories
  getCategories(boutiqueId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories/boutique/${boutiqueId}`);
  }

  createCategory(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/categories`, data);
  }

  updateCategory(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/categories/${id}`, data);
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/categories/${id}`);
  }
}
