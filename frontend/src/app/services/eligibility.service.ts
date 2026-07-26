import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EligibilityCheckPayload, EligibilityMatch } from '../models/policy.model';

@Injectable({ providedIn: 'root' })
export class EligibilityService {
  private readonly baseUrl = `${environment.apiUrl}/eligibility`;

  constructor(private http: HttpClient) {}

  check(payload: EligibilityCheckPayload): Observable<{ matches: EligibilityMatch[] }> {
    return this.http.post<{ matches: EligibilityMatch[] }>(`${this.baseUrl}/check`, payload);
  }
}
