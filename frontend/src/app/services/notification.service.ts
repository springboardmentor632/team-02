import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notification } from '../models/policy.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly baseUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ notifications: Notification[] }> {
    return this.http.get<{ notifications: Notification[] }>(this.baseUrl);
  }

  markRead(id: string): Observable<{ notification: Notification }> {
    return this.http.put<{ notification: Notification }>(`${this.baseUrl}/${id}/read`, {});
  }
}
