import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../services/auth.service';

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
          <p class="form-sub color">Enter your registered email and we'll send you an OTP from PolicyGPT support.</p>

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
          <p class="form-sub color">We've sent a 6-digit OTP to <strong>{{ email }}</strong>. Enter it below along with your new password.</p>

          <div class="error-banner" *ngIf="errorMsg">{{ errorMsg }}</div>
          <div class="error-banner" style="background:#EAF7EC; color:#2E7D32; border-color:#B9E6C0;" *ngIf="successMsg">
            {{ successMsg }}
          </div>

          <form #otpForm="ngForm" (ngSubmit)="onResetPassword(otpForm)" novalidate *ngIf="!successMsg">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label class="color">OTP Code</mat-label>
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
export class ForgotPasswordComponent implements OnInit {
  step: ForgotStep = 'email';

  email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';

  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const emailParam = this.route.snapshot.queryParams['email'];
    if (emailParam) {
      this.email = emailParam;
    }
  }

  onSendOtp(form: NgForm): void {
    if (form.invalid || !this.email) {
      this.errorMsg = 'Please enter a valid email address';
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.authService.forgotPassword(this.email.trim()).subscribe({
      next: (response) => {
        this.loading = false;
        this.step = 'otp';
        console.log('OTP sent successfully, step changed to otp:', response);
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = error?.error?.message || 'Failed to send OTP. Please check the email address and try again.';
        console.error('OTP request failed:', error);
        this.cdr.detectChanges();
      }
    });
  }

  onResendOtp(): void {
    if (!this.email) {
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.authService.forgotPassword(this.email.trim()).subscribe({
      next: (response) => {
        this.loading = false;
        this.errorMsg = '';
        this.successMsg = 'A new OTP has been sent to your email.';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.successMsg = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = error?.error?.message || 'Failed to resend OTP. Please try again.';
        console.error('Resend OTP failed:', error);
        this.cdr.detectChanges();
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
    this.cdr.detectChanges();

    this.authService.resetPassword({
      email: this.email.trim(),
      otp: this.otp.trim(),
      newPassword: this.newPassword
    }).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMsg = response?.message || 'Your password has been reset successfully. You can now log in.';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1800);
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = error?.error?.message || 'Invalid or expired OTP. Please try again.';
        console.error('Reset password failed:', error);
        this.cdr.detectChanges();
      }
    });
  }
}