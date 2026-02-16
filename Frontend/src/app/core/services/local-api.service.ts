import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class LocalApiService {
  private apiUrl = `${environment.apiUrl}/api/locaux`;

  constructor(private http: HttpClient) {}

  getLocaux(etage?: number): Observable<any[]> {
    const params = etage ? `?etage=${etage}` : '';
    return this.http.get<any[]>(`${this.apiUrl}${params}`);
  }

  getLocal(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createLocal(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateLocal(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  assignBoutique(id: string, boutiqueId: string | null): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/assign-boutique`, { id_boutique: boutiqueId });
  }

  deleteLocal(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
