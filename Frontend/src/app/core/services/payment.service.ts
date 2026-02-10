import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Payment {
  _id: string;
  id_contract: any;
  id_boutique: any;
  mois: number;
  annee: number;
  montant: number;
  date_echeance: string;
  date_paiement?: string;
  status: 'paye' | 'en_attente' | 'en_retard';
  facture_numero: string;
  notes?: string;
  email_sent?: boolean;
  email_sent_date?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl = 'http://localhost:5000/api/payments';

  constructor(private http: HttpClient) {}

  getPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.apiUrl);
  }

  getPayment(id: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`);
  }

  getPaymentsByMonth(mois: number, annee: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/month/${mois}/${annee}`);
  }

  getPaymentsByStatus(status: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/status/${status}`);
  }

  markAsPaid(id: string): Observable<Payment> {
    return this.http.put<Payment>(`${this.apiUrl}/${id}/mark-paid`, {});
  }

  generateCurrentMonth(): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate-current-month`, {});
  }

  sendReminder(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/send-reminder`, {});
  }

  sendInvoiceByEmail(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/send-invoice`, {});
  }

  downloadInvoicePDF(id: string): void {
    window.open(`${this.apiUrl}/${id}/invoice-pdf`, '_blank');
  }

  checkOverdue(): Observable<any> {
    return this.http.get(`${this.apiUrl}/check-overdue/run`);
  }

  deletePayment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
