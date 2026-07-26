import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly baseUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  generate(type?: string): Observable<{ report: { title: string; type: string; data: Record<string, unknown>; generatedAt: string } }> {
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    return this.http.get<{ report: { title: string; type: string; data: Record<string, unknown>; generatedAt: string } }>(this.baseUrl, { params });
  }
}
