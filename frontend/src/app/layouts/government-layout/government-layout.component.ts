import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-government-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './government-layout.component.html',
  styleUrl: './government-layout.component.css'
})
export class GovernmentLayoutComponent implements OnInit {
  officialName = '';
  userInitials = '';
  department = '';
  unreadCount = 0;
  sidebarOpen = false;

  constructor(
    private auth: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.officialName = this.auth.getUserDisplayName();
    this.userInitials = this.auth.getUserInitials();
    this.department = this.auth.getCurrentUser()?.organization || 'Government of India';
    this.notificationService.getAll().subscribe({
      next: (res) => { this.unreadCount = res.notifications.filter(n => !n.read).length; },
      error: () => { this.unreadCount = 0; }
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}
