import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface UserApi {
  _id: string;
  username: string;
  email: string;
  id_role?: { _id: string; role_name: string };
  createdAt?: string;
  boutique?: { boutiqueId: string; boutiqueNom: string } | null;
}

export interface UserApiResponse {
  data: UserApi[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private apiUrl = 'http://localhost:5000/api/users';

  constructor(private http: HttpClient) {}

  getAll(params?: { role?: string; unassigned?: boolean; search?: string; page?: number; limit?: number }): Observable<UserApi[]> {
    const url = this.buildUrl(params);
    return this.http.get<UserApiResponse>(url).pipe(
      map(res => res.data)
    );
  }

  getPaginated(params?: { role?: string; unassigned?: boolean; search?: string; page?: number; limit?: number }): Observable<UserApiResponse> {
    const url = this.buildUrl(params);
    return this.http.get<UserApiResponse>(url);
  }

  private buildUrl(params?: { role?: string; unassigned?: boolean; search?: string; page?: number; limit?: number }): string {
    const queryParams: string[] = [];
    if (params?.role) queryParams.push(`role=${params.role}`);
    if (params?.unassigned) queryParams.push(`unassigned=true`);
    if (params?.search) queryParams.push(`search=${encodeURIComponent(params.search)}`);
    if (params?.page) queryParams.push(`page=${params.page}`);
    if (params?.limit) queryParams.push(`limit=${params.limit}`);
    return queryParams.length ? `${this.apiUrl}?${queryParams.join('&')}` : this.apiUrl;
  }
}
