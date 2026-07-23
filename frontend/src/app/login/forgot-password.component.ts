import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

type ForgotStep = 'email' | 'otp';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  styleUrl: './login.component.css',
  template: `
    <div class="auth-form-side" style="min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--bg);">
      <div class="auth-box">

        <ng-container *ngIf="step === 'email'">
          <h3 class="form-title">Reset your password</h3>
          <p class="form-sub color">Enter your registered email and we'll send you an OTP</p>

          <div class="error-banner" *ngIf="errorMsg">{{ errorMsg }}</div>

          <form #f="ngForm" (ngSubmit)="onSendOtp(f)" novalidate>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label class="color">Email Address</mat-label>
              <input matInput type="email" name="email" placeholder="you@example.gov.in" [(ngModel)]="email" required email />
            </mat-form-field>

            <button mat-raised-button color="primary" id="but" type="submit" class="full-width btn-submit" [disabled]="loading">
              <span *ngIf="!loading" class="white">Send OTP</span>
              <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
            </button>
          </form>
        </ng-container>

        <ng-container *ngIf="step === 'otp'">
          <h3 class="form-title">Enter OTP</h3>
          <p class="form-sub color">We've sent a 6-digit OTP to {{ email }}. Enter it below along with your new password.</p>

          <div class="error-banner" *ngIf="errorMsg">{{ errorMsg }}</div>
          <div class="error-banner" style="background:#EAF7EC; color:#2E7D32; border-color:#B9E6C0;" *ngIf="successMsg">
            {{ successMsg }}
          </div>

          <form #otpForm="ngForm" (ngSubmit)="onResetPassword(otpForm)" novalidate *ngIf="!successMsg">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label class="color">OTP</mat-label>
              <input matInput type="text" name="otp" placeholder="Enter 6-digit OTP" [(ngModel)]="otp" required minlength="6" maxlength="6" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label class="color">New Password</mat-label>
              <input matInput type="password" name="newPassword" placeholder="Enter new password" [(ngModel)]="newPassword" required minlength="6" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label class="color">Confirm New Password</mat-label>
              <input matInput type="password" name="confirmPassword" placeholder="Re-enter new password" [(ngModel)]="confirmPassword" required minlength="6" />
            </mat-form-field>

            <button mat-raised-button color="primary" id="but" type="submit" class="full-width btn-submit" [disabled]="loading">
              <span *ngIf="!loading" class="white">Reset Password</span>
              <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
            </button>
          </form>

          <p class="terms-note color" style="margin-top:12px; cursor:pointer;" (click)="onResendOtp()" *ngIf="!successMsg">
            Didn't get the OTP? <a class="color">Resend OTP</a>
          </p>
        </ng-container>

        <p class="terms-note" style="margin-top:16px;">
          <a routerLink="/login" class="color">← Back to Login page</a>
        </p>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  step: ForgotStep = 'email';

  email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';

  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  onSendOtp(form: NgForm): void {
    if (form.invalid) {
      this.errorMsg = 'Please enter a valid email address';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.http.post<any>(
      'http://localhost:5000/api/auth/forgot-password',
      { email: this.email }
    ).subscribe({
      next: (response) => {
        this.loading = false;
        console.log(response);
        this.step = 'otp';
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = error?.error?.message || 'Failed to send OTP. Please check the email and try again.';
        console.log(error);
      }
    });
  }

  onResendOtp(): void {
    if (!this.email) {
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.http.post<any>(
      'http://localhost:5000/api/auth/forgot-password',
      { email: this.email }
    ).subscribe({
      next: (response) => {
        this.loading = false;
        console.log(response);
        this.errorMsg = '';
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = error?.error?.message || 'Failed to resend OTP. Please try again.';
        console.log(error);
      }
    });
  }

  onResetPassword(form: NgForm): void {
    if (form.invalid) {
      this.errorMsg = 'Please fill in all fields correctly';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMsg = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.http.post<any>(
      'http://localhost:5000/api/auth/reset-password',
      {
        email: this.email,
        otp: this.otp,
        newPassword: this.newPassword
      }
    ).subscribe({
      next: (response) => {
        this.loading = false;
        console.log(response);
        this.successMsg = 'Your password has been reset successfully. You can now log in.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = error?.error?.message || 'Invalid or expired OTP. Please try again.';
        console.log(error);
      }
    });
  }
}