import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HoraireBoutiqueService {

  private apiUrl= `${environment.apiUrl}/horaire`;


  constructor(private http: HttpClient) {}
  getHoraire(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  addHoraire(horaire: any): Observable<any> {
    return this.http.post(this.apiUrl, horaire);
 }

 updateHoraire(id: string, horaire: any): Observable<any> {
 return this.http.put(`${this.apiUrl}/${id}`, horaire);
 }

 deleteHoraire(id: string): Observable<any> {
 return this.http.delete(`${this.apiUrl}/${id}`);
 }
}
