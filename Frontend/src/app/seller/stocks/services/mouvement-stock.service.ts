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

  getMouvements(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getCurrentStocks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/current-stocks`);
  }

  addMouvement(mouvement: any): Observable<any> {
    return this.http.post(this.apiUrl, mouvement);
  }
}
