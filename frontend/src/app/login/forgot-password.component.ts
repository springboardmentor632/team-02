import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
        <h3 class="form-title">Reset your password</h3>
        <p  class="form-sub color">Enter your registered email and we'll send you a reset link</p>

        <div class="error-banner" *ngIf="errorMsg">{{ errorMsg }}</div>
        <div class="error-banner" style="background:#EAF7EC; color:#2E7D32; border-color:#B9E6C0;" *ngIf="successMsg">
          {{ successMsg }}
        </div>

        <form #f="ngForm" (ngSubmit)="onSubmit(f)" novalidate *ngIf="!successMsg">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label class="color">Email Address</mat-label>
            <input matInput type="email" name="email" placeholder="you@example.gov.in" [(ngModel)]="email" required email />
          </mat-form-field>

          <button mat-raised-button color="primary" id="but" type="submit" class="full-width btn-submit" [disabled]="loading">
            <span *ngIf="!loading"class="white" >Send Reset Link</span>
            <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
          </button>
        </form>

        <p class="terms-note" style="margin-top:16px;">
          <a routerLink="/login" class="color">← Back to Login page</a>
        </p>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  errorMsg = '';
  successMsg = '';

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.errorMsg = 'Please enter a valid email address';
      this.successMsg = '';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    
    setTimeout(() => {
      this.loading = false;
      this.successMsg = 'If this email is registered, a reset link has been sent. Please check your inbox.';
    }, 900);
  }
}