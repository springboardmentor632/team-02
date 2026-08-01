import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notification } from '../models/policy.model';

export interface NotificationPreferences {
  emailAlerts: boolean;
  smsAlerts: boolean;
  inAppAlerts: boolean;
  deadlineReminders: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly baseUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getAll(category?: string): Observable<{ notifications: Notification[] }> {
    let params = new HttpParams();
    if (category && category !== 'all') {
      params = params.set('category', category);
    }
    return this.http.get<{ notifications: Notification[] }>(this.baseUrl, { params });
  }

  markRead(id: string): Observable<{ notification: Notification }> {
    return this.http.put<{ notification: Notification }>(`${this.baseUrl}/${id}/read`, {});
  }

  markAllRead(): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/read-all`, {});
  }

  getPreferences(): Observable<{ preferences: NotificationPreferences; email?: string; phone?: string }> {
    return this.http.get<{ preferences: NotificationPreferences; email?: string; phone?: string }>(`${this.baseUrl}/preferences`);
  }

  updatePreferences(preferences: NotificationPreferences): Observable<{ preferences: NotificationPreferences }> {
    return this.http.put<{ preferences: NotificationPreferences }>(`${this.baseUrl}/preferences`, preferences);
  }

  sendTestNotification(payload: { title?: string; message?: string; category?: string; type?: string }): Observable<{ notification: Notification; message: string }> {
    return this.http.post<{ notification: Notification; message: string }>(`${this.baseUrl}/test-dispatch`, payload);
  }
}
