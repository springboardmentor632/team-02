import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterLink } from '@angular/router';

interface Notification {
  id: number;
  type: 'policy' | 'scheme' | 'deadline' | 'application';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent {
  constructor(private router: Router) {}
  userName = 'Rahul Sharma';
  userLocation = 'Citizen · Delhi';
  filter: 'all' | 'unread' = 'all';

  notifications: Notification[] = [
    { id: 1, type: 'policy', title: 'New Education Policy Released', message: 'Ministry of Education has published a new policy on digital learning infrastructure.', time: '2 hours ago', read: false },
    { id: 2, type: 'deadline', title: 'Scholarship Application Deadline Approaching', message: 'PM Scholarship Scheme application closes in 3 days. Apply now.', time: '5 hours ago', read: false },
    { id: 3, type: 'scheme', title: 'Scheme Update: Kisan Samman Nidhi', message: 'Eligibility criteria updated for the Farmer Welfare category.', time: '1 day ago', read: true },
    { id: 4, type: 'application', title: 'Application Status Updated', message: 'Your application for Ayushman Bharat has been approved.', time: '2 days ago', read: true }
  ];

  get filteredNotifications(): Notification[] {
    return this.filter === 'unread' ? this.notifications.filter(n => !n.read) : this.notifications;
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  setFilter(f: 'all' | 'unread'): void {
    this.filter = f;
  }

  markAsRead(n: Notification): void {
    n.read = true;
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
  }

  iconFor(type: Notification['type']): string {
    switch (type) {
      case 'policy': return '📄';
      case 'scheme': return '🎁';
      case 'deadline': return '⏰';
      case 'application': return '✅';
      default: return '🔔';
    }
  }
  onLogout(): void {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      window.location.href = '/login'; // यह बिना किसी एरर के सीधा लॉगिन पेज पर भेज देगा
    }
  }
   
}