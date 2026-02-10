import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private apiUrl= `${environment.apiUrl}/users`;


  constructor(private http: HttpClient) {}

  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  addUser(user: any): Observable<any> {
    return this.http.post(this.apiUrl, user);
 }

 updateUser(id: string, user: any): Observable<any> {
 return this.http.put(`${this.apiUrl}/${id}`, user);
 }

 deleteUser(id: string): Observable<any> {
 return this.http.delete(`${this.apiUrl}/${id}`);
}
}
