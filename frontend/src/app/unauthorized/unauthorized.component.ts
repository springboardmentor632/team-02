import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css'
})
export class UnauthorizedComponent {
  constructor(private auth: AuthService, private router: Router) {}

  goToDashboard(): void {
    const role = this.auth.getCurrentUser()?.role;
    this.auth.navigateByRole(role);
  }

  goToLogin(): void {
    this.auth.logout();
  }
}
