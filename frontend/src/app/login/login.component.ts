import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';

declare const google: any;

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  hidePassword = true;
  hideRegisterPassword = true;
  authMode: AuthMode = 'login';
  selectedTabIndex = 0;
  loginEmail = '';
  loginPassword = '';

  regFirstName = '';
  regLastName = '';
  regEmail = '';
  regRole = 'Citizen';
  regPassword = '';

  roles = ['Citizen', 'Government Official', 'Administrator', 'Researcher', 'Organization'];

  errorMsg = '';
  loading = false;
  googleLoading = false;

  private readonly GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

  private googleClient: any;
  private googleReady = false;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initGoogleClient();
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getCurrentUser();
      this.authService.navigateByRole(user?.role);
    }
  }

  private initGoogleClient(retryCount = 0): void {
    if (typeof google === 'undefined' || !google.accounts) {
      if (retryCount < 10) {
        setTimeout(() => this.initGoogleClient(retryCount + 1), 300);
      } else {
        console.error('Google script failed to load — check the script tag in index.html');
      }
      return;
    }

    if (this.GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID')) {
      console.warn('Google login is disabled — GOOGLE_CLIENT_ID is still a placeholder');
      return;
    }

    try {
      this.googleClient = google.accounts.oauth2.initTokenClient({
        client_id: this.GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        ux_mode: 'popup',
        callback: (response: any) => this.handleGoogleResponse(response)
      });
      this.googleReady = true;
    } catch (err) {
      console.error('Error initializing Google client:', err);
    }
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.authMode = index === 0 ? 'login' : 'register';
    this.errorMsg = '';
  }

  continueWithGoogle(): void {
    if (this.GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID')) {
      this.errorMsg = 'Google login is not configured yet (missing Client ID)';
      return;
    }
    if (!this.googleReady || !this.googleClient) {
      this.errorMsg = 'Google login is still loading, please try again shortly';
      this.initGoogleClient();
      return;
    }
    this.errorMsg = '';
    this.googleLoading = true;
    this.googleClient.requestAccessToken();
  }

  private handleGoogleResponse(response: any): void {
    if (!response || response.error) {
      this.googleLoading = false;
      this.errorMsg = 'Google login failed, please try again';
      this.cdr.detectChanges();
      return;
    }

    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${response.access_token}` }
    })
      .then(res => res.json())
      .then(profile => {
        console.log('Google profile:', profile);
        this.googleLoading = false;
        this.authService.navigateByRole('Citizen');
        this.cdr.detectChanges();
      })
      .catch(err => {
        this.googleLoading = false;
        this.errorMsg = 'Something went wrong while fetching the profile';
        console.error(err);
        this.cdr.detectChanges();
      });
  }

  onLogin(form: NgForm): void {
    if (this.loading) {
      return;
    }

    if (form.invalid) {
      this.errorMsg = 'Please fill in both email and password';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.authService.login({
      email: this.loginEmail,
      password: this.loginPassword
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response) => {
        this.authService.saveSession(response);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const q = this.route.snapshot.queryParamMap.get('q');
        if (returnUrl) {
          const redirect = returnUrl === 'policy-search' ? '/citizen/search' : returnUrl;
          this.router.navigate([redirect], { queryParams: q ? { q } : {} });
        } else {
          this.authService.navigateByRole(response.user?.role);
        }
      },
      error: (error) => {
        this.errorMsg = this.getErrorMessage(error);
      }
    });
  }

  onRegister(form: NgForm): void {
    if (this.loading) {
      return;
    }

    if (form.invalid) {
      this.errorMsg = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.authService.register({
      firstName: this.regFirstName,
      lastName: this.regLastName,
      email: this.regEmail,
      role: this.regRole,
      password: this.regPassword,
      confirmPassword: this.regPassword
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        alert('Registration successful! Please login.');
        form.resetForm();
        this.regRole = 'Citizen';
        this.selectedTabIndex = 0;
        this.authMode = 'login';
      },
      error: (error) => {
        this.errorMsg = this.getErrorMessage(error);
      }
    });
  }

  private getErrorMessage(error: { status?: number; error?: { message?: string } }): string {
    if (error.status === 401) {
      return 'Invalid email or password.';
    }
    if (error.status === 409) {
      return error.error?.message || 'User already exists.';
    }
    if (error.status === 400) {
      return error.error?.message || 'Please check your input and try again.';
    }
    if (error.status === 500) {
      return 'Internal server error. Please try again later.';
    }
    if (error.status === 0) {
      return 'Cannot connect to the server. Make sure the backend is running.';
    }
    return error.error?.message || 'Something went wrong.';
  }
}
