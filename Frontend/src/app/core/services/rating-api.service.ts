import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface ArticleRating {
  moyenne: number;
  count: number;
  userNote: number | null;
}

export interface BoutiqueRating {
  moyenne: number;
  count: number;
  userNote: number | null;
}

@Injectable({ providedIn: 'root' })
export class RatingApiService {
  private apiUrl = `${environment.apiUrl}/api/avis`;

  constructor(private http: HttpClient) {}

  getArticleRating(articleId: string): Observable<ArticleRating> {
    return this.http.get<ArticleRating>(`${this.apiUrl}/article/${articleId}`);
  }

  rateArticle(articleId: string, note: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/article/${articleId}`, { note });
  }

  getBoutiqueRating(boutiqueId: string): Observable<BoutiqueRating> {
    return this.http.get<BoutiqueRating>(`${this.apiUrl}/boutique/${boutiqueId}`);
  }

  rateBoutique(boutiqueId: string, note: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/boutique/${boutiqueId}`, { note });
  }
}
