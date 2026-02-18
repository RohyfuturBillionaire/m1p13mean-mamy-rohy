import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FaqService {

    private apiUrl= `${environment.apiUrl}/faqs`;


  constructor(private http: HttpClient) {}

  getFaqs(): Observable<any> {
 return this.http.get(`${this.apiUrl}`);
 }

 addFaq(faq: any): Observable<any> {
 return this.http.post(this.apiUrl, faq);
 }

 updateFaq(id: string, faq: any): Observable<any> {
 return this.http.put(`${this.apiUrl}/${id}`, faq);
 }

 deleteFaq(id: string): Observable<any> {
 return this.http.delete(`${this.apiUrl}/${id}`);
}
}
