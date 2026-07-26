import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Policy, Scheme } from '../models/policy.model';

export interface SearchPayload {
  query?: string;
  category?: string;
  ministry?: string;
  state?: string;
  department?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly baseUrl = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient) {}

  search(payload: SearchPayload): Observable<{ policies: Policy[]; schemes: Scheme[] }> {
    return this.http.post<{ policies: Policy[]; schemes: Scheme[] }>(this.baseUrl, payload);
  }

  getHistory(): Observable<{ history: { query: string; searchedAt: string }[] }> {
    return this.http.get<{ history: { query: string; searchedAt: string }[] }>(`${this.baseUrl}/history`);
  }
}
