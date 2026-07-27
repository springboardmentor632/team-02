import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-citizen-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './citizen-layout.component.html',
  styleUrl: './citizen-layout.component.css'
})
export class CitizenLayoutComponent implements OnInit {
  userName = '';
  userInitials = '';
  userSubtitle = '';
  unreadCount = 0;
  sidebarOpen = false;

  constructor(
    private auth: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.userName = this.auth.getUserDisplayName();
    this.userInitials = this.auth.getUserInitials();
    this.userSubtitle = this.auth.getUserSubtitle();
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
