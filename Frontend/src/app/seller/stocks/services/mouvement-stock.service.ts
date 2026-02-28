import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { environment } from '../../../../../environments/environments';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class MouvementStockService {

  private apiUrl = `${environment.apiUrl}/mouvementstock`;

  constructor(private http: HttpClient) { }

  private getBoutiqueId(): string | null {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      return userData?.user?.boutiqueId || null;
    } catch {
      return null;
    }
  }

  getMouvements(): Observable<any[]> {
    const boutiqueId = this.getBoutiqueId();
    const url = boutiqueId
      ? `${this.apiUrl}?boutique_id=${boutiqueId}`
      : this.apiUrl;
    return this.http.get<any[]>(url);
  }

  getCurrentStocks(): Observable<any[]> {
    const boutiqueId = this.getBoutiqueId();
    const url = boutiqueId
      ? `${this.apiUrl}/current-stocks?boutique_id=${boutiqueId}`
      : `${this.apiUrl}/current-stocks`;
    return this.http.get<any[]>(url);
  }

  addMouvement(mouvement: any): Observable<any> {
    return this.http.post(this.apiUrl, mouvement);
  }
}
