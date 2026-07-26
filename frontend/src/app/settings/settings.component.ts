import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  userName = '';
  userLocation = '';
  emailNotifications = true;
  smsNotifications = false;
  inAppNotifications = true;

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  saving = false;
  saved = false;

  changingPassword = false;
  passwordError = '';
  passwordSuccess = '';

  notifications: { _id: string }[] = [];

  constructor(
    private router: Router,
    private auth: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.userName = this.auth.getUserDisplayName();
    this.userLocation = this.auth.getUserSubtitle();
    this.notificationService.getAll().subscribe({
      next: (res) => { this.notifications = res.notifications.filter(n => !n.read); },
      error: () => { this.notifications = []; }
    });
  }

  saveSettings(): void {
    this.saving = true;
    this.saved = false;
    setTimeout(() => {
      this.saving = false;
      this.saved = true;
    }, 500);
  }

  changePassword(): void {
    this.passwordError = '';
    this.passwordSuccess = '';

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'Please fill in all password fields';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'New password and confirm password do not match';
      return;
    }
    if (this.newPassword.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      return;
    }

    this.changingPassword = true;
    this.auth.updateProfile({ password: this.newPassword }).subscribe({
      next: () => {
        this.changingPassword = false;
        this.passwordSuccess = 'Your password has been changed successfully!';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: () => {
        this.changingPassword = false;
        this.passwordError = 'Failed to change password. Check your current password.';
      }
    });
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}
