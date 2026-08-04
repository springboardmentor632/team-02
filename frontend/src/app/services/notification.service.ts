import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
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
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAll(category?: string): Observable<{ notifications: Notification[] }> {
    let params = new HttpParams();
    if (category && category !== 'all') {
      params = params.set('category', category);
    }
    return this.http.get<{ notifications: Notification[] }>(this.baseUrl, { params }).pipe(
      tap((res) => {
        if (res && res.notifications) {
          const unread = res.notifications.filter((n) => !n.read).length;
          this.unreadCountSubject.next(unread);
        }
      })
    );
  }

  markRead(id: string): Observable<{ notification: Notification }> {
    return this.http.put<{ notification: Notification }>(`${this.baseUrl}/${id}/read`, {}).pipe(
      tap(() => {
        const current = this.unreadCountSubject.value;
        this.unreadCountSubject.next(Math.max(0, current - 1));
      })
    );
  }

  markAllRead(): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/read-all`, {}).pipe(
      tap(() => {
        this.unreadCountSubject.next(0);
      })
    );
  }

  getPreferences(): Observable<{ preferences: NotificationPreferences; email?: string; phone?: string }> {
    return this.http.get<{ preferences: NotificationPreferences; email?: string; phone?: string }>(`${this.baseUrl}/preferences`);
  }

  updatePreferences(preferences: NotificationPreferences): Observable<{ preferences: NotificationPreferences }> {
    return this.http.put<{ preferences: NotificationPreferences }>(`${this.baseUrl}/preferences`, preferences);
  }

  sendTestNotification(payload: { title?: string; message?: string; category?: string; type?: string }): Observable<{ notification: Notification; message: string }> {
    return this.http.post<{ notification: Notification; message: string }>(`${this.baseUrl}/test-dispatch`, payload).pipe(
      tap((res) => {
        if (res && res.notification && !res.notification.read) {
          this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
        }
      })
    );
  }
}
