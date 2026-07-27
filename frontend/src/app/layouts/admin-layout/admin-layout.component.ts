import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PolicyService } from '../../services/policy.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent implements OnInit {
  adminName = '';
  userInitials = '';
  pendingCount = 0;
  sidebarOpen = false;

  constructor(
    private auth: AuthService,
    private policyService: PolicyService
  ) {}

  ngOnInit(): void {
    this.adminName = this.auth.getUserDisplayName();
    this.userInitials = this.auth.getUserInitials();
    this.policyService.getAll({ status: 'Pending' }).subscribe({
      next: (res) => { this.pendingCount = res.policies.length; },
      error: () => { this.pendingCount = 0; }
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}
