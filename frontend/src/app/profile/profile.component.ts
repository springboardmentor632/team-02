import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  userName = '';
  userLocation = '';
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  role = '';
  organization = '';

  saving = false;
  saved = false;
  error = '';
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
    const user = this.auth.getCurrentUser();
    if (user) {
      this.firstName = user.firstName;
      this.lastName = user.lastName;
      this.email = user.email;
      this.role = user.role;
      this.phone = user.phone || '';
      this.organization = user.organization || '';
    }
    this.auth.getProfile().subscribe({
      next: (res) => {
        const u = res.user as unknown as Record<string, string>;
        this.firstName = u['firstName'] || this.firstName;
        this.lastName = u['lastName'] || this.lastName;
        this.email = u['email'] || this.email;
        this.role = u['role'] || this.role;
        this.phone = u['phone'] || '';
        this.organization = u['organization'] || '';
        localStorage.setItem('user', JSON.stringify({
          id: u['_id'] || u['id'],
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          role: this.role,
          phone: this.phone,
          organization: this.organization,
        }));
      }
    });
  }

  onSave(): void {
    this.saving = true;
    this.saved = false;
    this.error = '';
    this.auth.updateProfile({
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      organization: this.organization,
    }).subscribe({
      next: () => {
        this.saving = false;
        this.saved = true;
        this.userName = `${this.firstName} ${this.lastName}`;
      },
      error: () => {
        this.saving = false;
        this.error = 'Failed to save profile.';
      }
    });
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}
