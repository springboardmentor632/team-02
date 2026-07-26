import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PlatformStats } from '../models/policy.model';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly baseUrl = `${environment.apiUrl}/stats`;

  constructor(private http: HttpClient) {}

  getPlatformStats(): Observable<{ stats: PlatformStats; trending: string[] }> {
    return this.http.get<{ stats: PlatformStats; trending: string[] }>(this.baseUrl);
  }
}
