import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface Faq {
  _id: string;
  question: string;
  reponse: string;
  id_boutique: string;
  id_categorie: string;
  ordre: number;
  createdAt?: string;
}

export interface FaqCategorie {
  _id: string;
  nom_categorie: string;
}

@Injectable({ providedIn: 'root' })
export class FaqService {
  private faqUrl = `${environment.apiUrl}/faqs`;
  private categorieUrl = `${environment.apiUrl}/faqCategories`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Faq[]> {
    return this.http.get<Faq[]>(this.faqUrl);
  }

  getCategories(): Observable<FaqCategorie[]> {
    return this.http.get<FaqCategorie[]>(this.categorieUrl);
  }

  getByBoutique(boutiqueId: string): Observable<Faq[]> {
    return this.http.get<Faq[]>(`${this.faqUrl}/boutique/${boutiqueId}`);
  }
}
