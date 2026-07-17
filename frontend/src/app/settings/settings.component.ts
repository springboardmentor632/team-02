import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
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

  saveSettings(): void {
    this.saving = true;
    this.saved = false;
    // TODO: real backend call — PUT /users/settings
    setTimeout(() => {
      this.saving = false;
      this.saved = true;
    }, 700);
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

    // TODO: real backend call — POST /auth/change-password
    setTimeout(() => {
      this.changingPassword = false;
      this.passwordSuccess = 'Your password has been changed successfully!';
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    }, 800);
  }
}