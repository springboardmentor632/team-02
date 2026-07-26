import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EligibilityRule, Scheme } from '../models/policy.model';

@Injectable({ providedIn: 'root' })
export class SchemeService {
  private readonly baseUrl = `${environment.apiUrl}/schemes`;

  constructor(private http: HttpClient) {}

  getAll(params?: Record<string, string>): Observable<{ schemes: Scheme[] }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) httpParams = httpParams.set(k, v);
      });
    }
    return this.http.get<{ schemes: Scheme[] }>(this.baseUrl, { params: httpParams });
  }

  getById(id: string): Observable<{ scheme: Scheme }> {
    return this.http.get<{ scheme: Scheme }>(`${this.baseUrl}/${id}`);
  }

  compare(ids: string[]): Observable<{ schemes: Scheme[]; rules: Record<string, EligibilityRule> }> {
    return this.http.post<{ schemes: Scheme[]; rules: Record<string, EligibilityRule> }>(
      `${this.baseUrl}/compare`,
      { ids }
    );
  }

  create(data: Partial<Scheme>): Observable<{ scheme: Scheme }> {
    return this.http.post<{ scheme: Scheme }>(this.baseUrl, data);
  }

  update(id: string, data: Partial<Scheme>): Observable<{ scheme: Scheme }> {
    return this.http.put<{ scheme: Scheme }>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
