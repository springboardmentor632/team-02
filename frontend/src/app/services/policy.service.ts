import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Policy } from '../models/policy.model';

@Injectable({ providedIn: 'root' })
export class PolicyService {
  private readonly baseUrl = `${environment.apiUrl}/policies`;

  constructor(private http: HttpClient) {}

  getAll(params?: Record<string, string>): Observable<{ policies: Policy[] }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) httpParams = httpParams.set(k, v);
      });
    }
    return this.http.get<{ policies: Policy[] }>(this.baseUrl, { params: httpParams });
  }

  getById(id: string): Observable<{ policy: Policy }> {
    return this.http.get<{ policy: Policy }>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Policy>): Observable<{ policy: Policy }> {
    return this.http.post<{ policy: Policy }>(this.baseUrl, data);
  }

  update(id: string, data: Partial<Policy>): Observable<{ policy: Policy }> {
    return this.http.put<{ policy: Policy }>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  getSavedPolicies(): Observable<{ saved: any[] }> {
    return this.http.get<{ saved: any[] }>(`${this.baseUrl}/saved`);
  }

  savePolicy(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/${id}/save`, {});
  }

  unsavePolicy(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}/save`);
  }

  isSaved(id: string): Observable<{ saved: boolean }> {
    return this.http.get<{ saved: boolean }>(`${this.baseUrl}/${id}/is-saved`);
  }
}