import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PromotionApi {
  _id: string;
  titre: string;
  description: string;
  image: string;
  date_debut: string;
  date_fin: string;
  remise: number;
  id_article: { _id: string; nom?: string; prix?: number; images?: string[]; title?: string } | string;
  id_boutique: { _id: string; nom: string; logo: string; email: string } | string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export interface ArticleApi {
  _id: string;
  title: string;
  content: string;
}

@Injectable({ providedIn: 'root' })
export class PromotionService {
  private apiUrl = 'http://localhost:5000/api/promotions';
  private articlesUrl = 'http://localhost:5000/articles';

  constructor(private http: HttpClient) {}

  // === CRUD ===

  getAll(params?: { status?: string; id_boutique?: string }): Observable<PromotionApi[]> {
    let url = this.apiUrl;
    const queryParts: string[] = [];
    if (params?.status) queryParts.push(`status=${params.status}`);
    if (params?.id_boutique) queryParts.push(`id_boutique=${params.id_boutique}`);
    if (queryParts.length) url += '?' + queryParts.join('&');
    return this.http.get<PromotionApi[]>(url);
  }

  getByBoutique(boutiqueId: string): Observable<PromotionApi[]> {
    return this.http.get<PromotionApi[]>(`${this.apiUrl}/boutique/${boutiqueId}`);
  }

  getActive(): Observable<PromotionApi[]> {
    return this.http.get<PromotionApi[]>(`${this.apiUrl}/active`);
  }

  getById(id: string): Observable<PromotionApi> {
    return this.http.get<PromotionApi>(`${this.apiUrl}/${id}`);
  }

  create(formData: FormData): Observable<PromotionApi> {
    return this.http.post<PromotionApi>(this.apiUrl, formData);
  }

  update(id: string, formData: FormData): Observable<PromotionApi> {
    return this.http.put<PromotionApi>(`${this.apiUrl}/${id}`, formData);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // === Admin actions ===

  approve(id: string): Observable<PromotionApi> {
    return this.http.patch<PromotionApi>(`${this.apiUrl}/${id}/approve`, {});
  }

  reject(id: string): Observable<PromotionApi> {
    return this.http.patch<PromotionApi>(`${this.apiUrl}/${id}/reject`, {});
  }

  // === Articles (for seller form select) ===

  getArticles(): Observable<ArticleApi[]> {
    return this.http.get<ArticleApi[]>(this.articlesUrl);
  }
}
