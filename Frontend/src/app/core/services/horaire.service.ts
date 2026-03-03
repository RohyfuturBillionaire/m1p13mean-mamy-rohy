import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface HoraireBoutique {
  _id: string;
  horaire_ouverture: string;
  horaire_fermeture: string;
  id_boutique: string;
  label: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class HoraireService {
  private apiUrl = `${environment.apiUrl}/horaire`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<HoraireBoutique[]> {
    return this.http.get<HoraireBoutique[]>(this.apiUrl);
  }

  getByBoutique(boutiqueId: string): Observable<HoraireBoutique[]> {
    return this.http.get<HoraireBoutique[]>(`${this.apiUrl}/${boutiqueId}`);
  }
}
