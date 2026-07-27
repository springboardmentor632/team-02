import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  organization?: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  confirmPassword: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, payload);
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    const { confirmPassword, ...body } = payload;
    return this.http.post<AuthResponse>(`${this.authUrl}/register`, body);
  }

  getProfile(): Observable<{ user: AuthUser }> {
    return this.http.get<{ user: AuthUser }>(`${this.authUrl}/profile`);
  }

  updateProfile(data: Partial<AuthUser & { password?: string }>): Observable<{ user: AuthUser }> {
    return this.http.put<{ user: AuthUser }>(`${this.authUrl}/profile`, data);
  }

  getAllUsers(): Observable<{ users: any[] }> {
    return this.http.get<{ users: any[] }>(`${this.authUrl}/users`);
  }

  updateUserRole(userId: string, role: string): Observable<{ user: any }> {
    return this.http.put<{ user: any }>(`${this.authUrl}/users/${userId}/role`, { role });
  }

  updateUserStatus(userId: string, status: string): Observable<{ user: any }> {
    return this.http.put<{ user: any }>(`${this.authUrl}/users/${userId}/status`, { status });
  }

  saveSession(response: AuthResponse): void {
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }

  getCurrentUser(): AuthUser | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserDisplayName(): string {
    const user = this.getCurrentUser();
    if (!user) return 'Guest';
    return `${user.firstName} ${user.lastName}`;
  }

  getUserInitials(): string {
    const user = this.getCurrentUser();
    if (!user) return 'GU';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  getUserSubtitle(): string {
    const user = this.getCurrentUser();
    if (!user) return 'Guest User';
    return `${user.role}${user.organization ? ' · ' + user.organization : ''}`;
  }

  getUserRole(): string {
    const user = this.getCurrentUser();
    if (!user) return 'citizen';
    switch (user.role) {
      case 'Administrator': return 'admin';
      case 'Government Official': return 'government';
      case 'Citizen': return 'citizen';
      case 'Researcher': return 'citizen';
      case 'Organization': return 'citizen';
      default: return 'citizen';
    }
  }

  navigateByRole(role: string | undefined): void {
    switch (role) {
      case 'Citizen':
        this.router.navigate(['/citizen/dashboard']);
        break;
      case 'Government Official':
        this.router.navigate(['/government/dashboard']);
        break;
      case 'Administrator':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'Researcher':
      case 'Organization':
      default:
        this.router.navigate(['/citizen/dashboard']);
        break;
    }
  }

  loginAndRedirect(payload: LoginPayload): Observable<AuthResponse> {
    return this.login(payload).pipe(
      tap((response) => {
        this.saveSession(response);
        this.navigateByRole(response.user?.role);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
