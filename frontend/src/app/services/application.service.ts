import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApplicationFormData,
  EligibilityProfile,
  SchemeApplication,
} from '../models/policy.model';

export interface SubmitApplicationPayload {
  applicationType?: 'scheme' | 'policy';
  schemeId?: string;
  policyId?: string;
  eligibilitySnapshot?: EligibilityProfile;
  formData: ApplicationFormData;
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly baseUrl = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}

  getMine(): Observable<{ applications: SchemeApplication[] }> {
    return this.http.get<{ applications: SchemeApplication[] }>(`${this.baseUrl}/mine`);
  }

  getById(id: string): Observable<{ application: SchemeApplication }> {
    return this.http.get<{ application: SchemeApplication }>(`${this.baseUrl}/${id}`);
  }

  getAll(): Observable<{ applications: SchemeApplication[] }> {
    return this.http.get<{ applications: SchemeApplication[] }>(this.baseUrl);
  }

  submit(payload: SubmitApplicationPayload): Observable<{ application: SchemeApplication }> {
    return this.http.post<{ application: SchemeApplication }>(this.baseUrl, payload);
  }

  updateStatus(id: string, status: string, govNotes?: string): Observable<{ application: SchemeApplication }> {
    return this.http.put<{ application: SchemeApplication }>(`${this.baseUrl}/${id}/status`, {
      status,
      govNotes,
    });
  }
}
