import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class AdminsService {
  private apiUrl= `${environment.apiUrl}/sitecrm`;


  constructor(private http: HttpClient) {}
 
  getSiteCrms(): Observable<any> {
 return this.http.get(`${this.apiUrl}/last`);
 }
 
 addSiteCrm(article: any): Observable<any> {
 return this.http.post(this.apiUrl, article);
 }

 updateSiteCrm(id: string, article: any): Observable<any> {
 return this.http.put(`${this.apiUrl}/${id}`, article);
 }

 deleteSiteCrm(id: string): Observable<any> {
 return this.http.delete(`${this.apiUrl}/${id}`);
}
}
