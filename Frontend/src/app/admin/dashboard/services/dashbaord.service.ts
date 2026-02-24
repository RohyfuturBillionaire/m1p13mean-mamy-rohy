import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface DashboardData {
  totalBoutiques: number;
  totalClients: number;
  revenue_par_mois: any[];
  boutiques: any[];
  promo_en_attente: number;
  promo_approuve: number;
  promo_rejete: number;
  revenuePayementLoyer: number;
}
@Injectable({
  providedIn: 'root'
})
export class DashboardService {


  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {
    // Restore token from localStorage on app init (survives page refresh)
    
  }

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}`, { withCredentials: true });
  }

}
