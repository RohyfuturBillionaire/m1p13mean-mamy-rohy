import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface Local {
  _id: string;
  numero: string;
  etage: number;
  x: number;
  y: number;
  loyer: number;
  status: boolean;
  longueur: number;
  largeur: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class LocalService {
  private apiUrl = `${environment.apiUrl}/local`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Local[]> {
    return this.http.get<Local[]>(this.apiUrl);
  }

  getAvailable(): Observable<Local[]> {
    return this.http.get<Local[]>(`${this.apiUrl}/available`);
  }

  getById(id: string): Observable<Local> {
    return this.http.get<Local>(`${this.apiUrl}/${id}`);
  }

  create(local: Partial<Local>): Observable<Local> {
    return this.http.post<Local>(this.apiUrl, local);
  }

  update(id: string, local: Partial<Local>): Observable<Local> {
    return this.http.put<Local>(`${this.apiUrl}/${id}`, local);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
