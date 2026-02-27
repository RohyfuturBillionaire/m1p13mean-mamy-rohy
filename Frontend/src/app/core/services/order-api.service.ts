import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { CommandeApi, CheckoutPayload, BoutiqueStats } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class OrderApiService {
  private apiUrl = `${environment.apiUrl}/api/commandes`;

  constructor(private http: HttpClient) {}

  checkout(payload: CheckoutPayload): Observable<{ commandes: CommandeApi[] }> {
    return this.http.post<{ commandes: CommandeApi[] }>(`${this.apiUrl}/checkout`, payload);
  }

  getMyOrders(): Observable<CommandeApi[]> {
    return this.http.get<CommandeApi[]>(this.apiUrl);
  }

  getOrder(id: string): Observable<CommandeApi> {
    return this.http.get<CommandeApi>(`${this.apiUrl}/${id}`);
  }

  getBoutiqueOrders(params?: { status?: string; page?: number; limit?: number }): Observable<{ data: CommandeApi[]; total: number; page: number; limit: number }> {
    const queryParams: string[] = [];
    if (params?.status) queryParams.push(`status=${params.status}`);
    if (params?.page) queryParams.push(`page=${params.page}`);
    if (params?.limit) queryParams.push(`limit=${params.limit}`);
    const query = queryParams.length ? `?${queryParams.join('&')}` : '';
    return this.http.get<any>(`${this.apiUrl}/boutique${query}`);
  }

  getBoutiqueStats(): Observable<BoutiqueStats> {
    return this.http.get<BoutiqueStats>(`${this.apiUrl}/boutique/stats`);
  }

  updateOrderStatus(orderId: string, status: string): Observable<CommandeApi> {
    return this.http.put<CommandeApi>(`${this.apiUrl}/${orderId}/status`, { status });
  }
}
