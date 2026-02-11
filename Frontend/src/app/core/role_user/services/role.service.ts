import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

 

  private apiUrl= `${environment.apiUrl}/roles`;


  constructor(private http: HttpClient) {}
 
  getRoles(): Observable<any> {
 return this.http.get(`${this.apiUrl}`);
 }

 addRole(role: any): Observable<any> {
 return this.http.post(this.apiUrl, role);
 }

 updateRole(id: string, role: any): Observable<any> {
 return this.http.put(`${this.apiUrl}/${id}`, role);
 }

 deleteRole(id: string): Observable<any> {
 return this.http.delete(`${this.apiUrl}/${id}`);

}
}
