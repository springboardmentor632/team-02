import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { StatsService } from '../../services/stats.service';

export interface UserRow {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  organization?: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  totalUsers = '—';
  loading = true;
  users: UserRow[] = [];
  roles = ['Administrator', 'Government Official', 'Citizen', 'Researcher', 'Organization'];

  constructor(
    private auth: AuthService,
    private statsService: StatsService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.statsService.getPlatformStats().subscribe({
      next: (res) => {
        this.totalUsers = res.stats.users.toString();
      }
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.auth.getAllUsers().subscribe({
      next: (res) => {
        this.users = res.users;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onRoleChange(user: UserRow, newRole: string): void {
    if (!newRole) return;
    this.auth.updateUserRole(user._id, newRole).subscribe({
      next: (res) => {
        user.role = res.user.role;
        alert(`User role updated to ${newRole} successfully.`);
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to update user role.');
      }
    });
  }

  toggleStatus(user: UserRow): void {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    this.auth.updateUserStatus(user._id, newStatus).subscribe({
      next: (res) => {
        user.status = res.user.status;
        alert(`User status updated to ${newStatus} successfully.`);
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to update user status.');
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    if (role === 'Administrator') return 'badge-admin';
    if (role === 'Government Official') return 'badge-govt';
    return 'badge-citizen';
  }
}
