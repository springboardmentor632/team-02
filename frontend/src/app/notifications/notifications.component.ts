import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService, NotificationPreferences } from '../services/notification.service';
import { Notification } from '../models/policy.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
  userName = '';
  userLocation = '';
  userInitials = '';

  activeTab: 'all' | 'policy_alert' | 'scheme_update' | 'deadline_reminder' | 'application_update' | 'unread' = 'all';
  loading = true;
  savingPreferences = false;
  testingDispatch = false;
  showPreferencesModal = false;
  toastMessage = '';

  notifications: Notification[] = [];
  preferences: NotificationPreferences = {
    emailAlerts: true,
    smsAlerts: true,
    inAppAlerts: true,
    deadlineReminders: true,
  };
  userEmail = '';
  userPhone = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userName = this.auth.getUserDisplayName();
    this.userLocation = this.auth.getUserSubtitle();
    this.userInitials = this.auth.getUserInitials();

    this.loadNotifications();
    this.loadPreferences();
  }

  loadNotifications(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.notificationService.getAll().subscribe({
      next: (res) => {
        this.notifications = res.notifications || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadPreferences(): void {
    this.notificationService.getPreferences().subscribe({
      next: (res) => {
        if (res.preferences) {
          this.preferences = res.preferences;
        }
        this.userEmail = res.email || '';
        this.userPhone = res.phone || '';
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  get filteredNotifications(): Notification[] {
    if (this.activeTab === 'unread') {
      return this.notifications.filter(n => !n.read);
    }
    if (this.activeTab === 'all') {
      return this.notifications;
    }
    return this.notifications.filter(n => n.category === this.activeTab);
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  get policyAlertsCount(): number {
    return this.notifications.filter(n => n.category === 'policy_alert').length;
  }

  get schemeUpdatesCount(): number {
    return this.notifications.filter(n => n.category === 'scheme_update').length;
  }

  get deadlineRemindersCount(): number {
    return this.notifications.filter(n => n.category === 'deadline_reminder').length;
  }

  get applicationCount(): number {
    return this.notifications.filter(n => n.category === 'application_update').length;
  }

  setTab(tab: 'all' | 'policy_alert' | 'scheme_update' | 'deadline_reminder' | 'application_update' | 'unread'): void {
    this.activeTab = tab;
  }

  markAsRead(n: Notification): void {
    if (n.read) return;
    this.notificationService.markRead(n._id).subscribe({
      next: () => {
        n.read = true;
        this.cdr.detectChanges();
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.showToast('All notifications marked as read.');
        this.cdr.detectChanges();
      }
    });
  }

  savePreferences(): void {
    this.savingPreferences = true;
    this.notificationService.updatePreferences(this.preferences).subscribe({
      next: () => {
        this.savingPreferences = false;
        this.showToast('Notification delivery preferences updated!');
        this.cdr.detectChanges();
      },
      error: () => {
        this.savingPreferences = false;
        this.showToast('Failed to update preferences.');
        this.cdr.detectChanges();
      }
    });
  }

  sendTestNotification(): void {
    this.testingDispatch = true;
    this.notificationService.sendTestNotification({
      title: '📢 New Policy Alert: Digital India Innovation Program',
      message: 'A new national policy update has been published. Dispatched to Email & SMS.',
      category: 'policy_alert',
      type: 'info',
    }).subscribe({
      next: (res) => {
        this.testingDispatch = false;
        if (res.notification) {
          this.notifications.unshift(res.notification);
        }
        this.showToast('Test notification dispatched via Email, SMS & In-App!');
        this.cdr.detectChanges();
      },
      error: () => {
        this.testingDispatch = false;
        this.showToast('Failed to dispatch test notification.');
        this.cdr.detectChanges();
      }
    });
  }

  iconFor(n: Notification): string {
    if (n.category === 'policy_alert') return '📢';
    if (n.category === 'scheme_update') return '🔄';
    if (n.category === 'deadline_reminder') return '⏰';
    if (n.category === 'application_update') return '📝';
    switch (n.type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'danger': return '🔴';
      default: return '🔔';
    }
  }

  categoryLabel(category?: string): string {
    switch (category) {
      case 'policy_alert': return 'Policy Alert';
      case 'scheme_update': return 'Scheme Update';
      case 'deadline_reminder': return 'Deadline Reminder';
      case 'application_update': return 'Application Notification';
      default: return 'System Alert';
    }
  }

  categoryBadgeClass(category?: string): string {
    switch (category) {
      case 'policy_alert': return 'badge-blue';
      case 'scheme_update': return 'badge-purple';
      case 'deadline_reminder': return 'badge-orange';
      case 'application_update': return 'badge-green';
      default: return 'badge-gray';
    }
  }

  formatTime(dateStr?: string): string {
    if (!dateStr) return 'Just now';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  togglePreferencesModal(): void {
    this.showPreferencesModal = !this.showPreferencesModal;
  }

  showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 4000);
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}
