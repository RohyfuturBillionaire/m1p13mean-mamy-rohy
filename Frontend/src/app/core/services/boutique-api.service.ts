import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface BoutiqueApi {
  _id: string;
  nom: string;
  logo?: string;
  email?: string;
  reseau?: string;
  horaire_ouvert?: string;
  user_proprietaire?: any;
  id_categorie?: any;
  loyer?: number;
  type_boutique?: string;
  status: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryApi {
  _id: string;
  nom: string;
  icone?: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class BoutiqueApiService {
  private apiUrl = 'http://localhost:5000/api/boutiques';
  private categoriesUrl = 'http://localhost:5000/api/categories';

  constructor(private http: HttpClient) {}

  getAll(): Observable<BoutiqueApi[]> {
    return this.http.get<{ data: BoutiqueApi[] }>(this.apiUrl).pipe(
      map(res => res.data)
    );
  }

  getById(id: string): Observable<BoutiqueApi> {
    return this.http.get<BoutiqueApi>(`${this.apiUrl}/${id}`);
  }

  create(formData: FormData): Observable<BoutiqueApi> {
    return this.http.post<BoutiqueApi>(this.apiUrl, formData);
  }

  update(id: string, formData: FormData): Observable<BoutiqueApi> {
    return this.http.put<BoutiqueApi>(`${this.apiUrl}/${id}`, formData);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getUnlinkedBoutiques(): Observable<BoutiqueApi[]> {
    return this.http.get<{ data: BoutiqueApi[] }>(`${this.apiUrl}/unlinked`).pipe(
      map(res => res.data)
    );
  }

  linkBoutiqueToUser(boutiqueId: string, userId: string): Observable<BoutiqueApi> {
    return this.http.put<BoutiqueApi>(`${this.apiUrl}/${boutiqueId}/link-user`, { userId });
  }

  getCategories(): Observable<CategoryApi[]> {
    return this.http.get<CategoryApi[]>(this.categoriesUrl);
  }

  createCategory(data: { nom: string; description?: string }): Observable<CategoryApi> {
    return this.http.post<CategoryApi>(this.categoriesUrl, data);
  }
}
