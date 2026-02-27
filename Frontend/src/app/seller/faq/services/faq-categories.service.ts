import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FaqCategoriesService {

  // constructor() { }
   private apiUrl= `${environment.apiUrl}/faqCategories`;


  constructor(private http: HttpClient) {}

  getFaqCategories(): Observable<any> {
 return this.http.get(`${this.apiUrl}/`);
 }

 addFaqCategory(category: any): Observable<any> {
 return this.http.post(this.apiUrl, category);
 }

 updateFaqCategory(id: string, category: any): Observable<any> {
 return this.http.put(`${this.apiUrl}/${id}`, category);
 }

 deleteFaqCategory(id: string): Observable<any> {
 return this.http.delete(`${this.apiUrl}/${id}`);
}
}
