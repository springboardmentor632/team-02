import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
  hidePassword=true;
  hideRegisterPassword=true;
  authMode: AuthMode = 'login';
  selectedTabIndex = 0;
  loginEmail = '';
  loginPassword = '';

  regFirstName = '';
  regLastName = '';
  regEmail = '';
  regRole = 'Citizen';
  regPassword = '';

  roles = ['Citizen', 'Government Official', 'Researcher', 'Organisation'];

  errorMsg = '';
  loading = false;
  googleLoading = false;

  // Replace with actual Client ID from Google Cloud Console > APIs & Services > Credentials
  private readonly GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

  private googleClient: any;
  private googleReady = false;

  constructor(
  private router: Router,
  private http: HttpClient
) {}

  ngOnInit(): void {
    this.initGoogleClient();
  }

  private initGoogleClient(retryCount = 0): void {
    if (typeof google === 'undefined' || !google.accounts) {
      // Google script may still be loading, retry a few times before giving up
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
      return;
    }

    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${response.access_token}` }
    })
      .then(res => res.json())
      .then(profile => {
        // TODO: send access_token to backend (FastAPI/Node /auth/google) for verification
        console.log('Google profile:', profile);
        this.googleLoading = false;
        this.router.navigate(['/dashboard']);
      })
      .catch(err => {
        this.googleLoading = false;
        this.errorMsg = 'Something went wrong while fetching the profile';
        console.error(err);
      });
  }

  onLogin(form: NgForm): void {
    if (form.invalid) {
      this.errorMsg = 'Please fill in both email and password';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    // TODO: replace with real backend call (POST /auth/login)
   const loginData = {
  email: this.loginEmail,
  password: this.loginPassword
};

this.http.post<any>(
  'http://localhost:4000/api/auth/login',
  loginData
).subscribe({
  next: (response) => {
    this.loading = false;
    console.log(response);

    if (response?.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMsg = 'Login succeeded but no token was returned';
    }
  },

  error: (error) => {
    this.loading = false;
    this.errorMsg = error.error?.message || 'Login failed';
    console.log(error);
  }
});
  }

  onRegister(form: NgForm): void {
    if (form.invalid) {
      this.errorMsg = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    // TODO: replace with real backend call (POST /auth/register)
    const registerData = {
  firstName: this.regFirstName,
  lastName: this.regLastName,
  email: this.regEmail,
  role: this.regRole,
  password: this.regPassword,
  confirmPassword: this.regPassword
};

this.http.post<any>(
  'http://localhost:4000/api/auth/register',
  registerData
).subscribe({
  next: (response) => {
    this.loading = false;
    console.log(response);

    alert('Registration successful! Please login.');

form.resetForm();
this.regRole = 'Citizen';

this.selectedTabIndex = 0;
  },

  error: (error) => {
    this.loading = false;
    this.errorMsg = error.error?.message || 'Registration failed';
    console.log(error);
  }
});
}}