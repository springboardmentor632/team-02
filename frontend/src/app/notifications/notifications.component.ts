import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { Notification } from '../models/policy.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
  userName = '';
  userLocation = '';
  userInitials = '';
  filter: 'all' | 'unread' = 'all';
  loading = true;

  notifications: Notification[] = [];

  constructor(
    private router: Router,
    private auth: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.userName = this.auth.getUserDisplayName();
    this.userLocation = this.auth.getUserSubtitle();
    this.userInitials = this.auth.getUserInitials();
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getAll().subscribe({
      next: (res) => {
        this.notifications = res.notifications;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get filteredNotifications(): Notification[] {
    return this.filter === 'unread' ? this.notifications.filter((n) => !n.read) : this.notifications;
  }

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  setFilter(f: 'all' | 'unread'): void {
    this.filter = f;
  }

  markAsRead(n: Notification): void {
    if (n.read) return;
    this.notificationService.markRead(n._id).subscribe({
      next: () => { n.read = true; }
    });
  }

  markAllAsRead(): void {
    const unread = this.notifications.filter((n) => !n.read);
    unread.forEach((n) => this.markAsRead(n));
  }

  iconFor(type: string): string {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⏰';
      case 'danger': return '🔴';
      default: return '🔔';
    }
  }

  formatTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}
