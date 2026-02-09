import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContractType {
  _id: string;
  contract_type_name: string;
}

export interface Contract {
  _id: string;
  contract_type: ContractType;
  date_debut: string;
  date_fin: string;
  id_boutique?: any;
  id_client?: any;
  loyer: number;
  nom_client: string;
  nom_entreprise: string;
  surface: number;
  etage: number;
  numero: string;
  statut: 'actif' | 'expire' | 'resilie';
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ContractService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getContractTypes(): Observable<ContractType[]> {
    return this.http.get<ContractType[]>(`${this.apiUrl}/contract-types`);
  }

  createContractType(data: { contract_type_name: string }): Observable<ContractType> {
    return this.http.post<ContractType>(`${this.apiUrl}/contract-types`, data);
  }

  updateContractType(id: string, data: { contract_type_name: string }): Observable<ContractType> {
    return this.http.put<ContractType>(`${this.apiUrl}/contract-types/${id}`, data);
  }

  deleteContractType(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/contract-types/${id}`);
  }

  getContracts(): Observable<Contract[]> {
    return this.http.get<Contract[]>(`${this.apiUrl}/contracts`);
  }

  getContract(id: string): Observable<Contract> {
    return this.http.get<Contract>(`${this.apiUrl}/contracts/${id}`);
  }

  createContract(data: any): Observable<Contract> {
    return this.http.post<Contract>(`${this.apiUrl}/contracts`, data);
  }

  updateContract(id: string, data: any): Observable<Contract> {
    return this.http.put<Contract>(`${this.apiUrl}/contracts/${id}`, data);
  }

  deleteContract(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/contracts/${id}`);
  }

  downloadPdf(id: string): void {
    window.open(`${this.apiUrl}/contracts/${id}/pdf`, '_blank');
  }
}
