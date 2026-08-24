import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  createdAt?: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  loading = true;
  error = '';
  users: UserRow[] = [];
  searchQuery = '';
  selectedRoleFilter = 'All Roles';

  roles = ['Administrator', 'Government Official', 'Citizen', 'Researcher', 'Organization'];
  roleFilterOptions = ['All Roles', 'Citizen', 'Government Official', 'Administrator', 'Researcher', 'Organization'];

  toastMessage = '';

  constructor(
    private auth: AuthService,
    private statsService: StatsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.auth.getAllUsers().subscribe({
      next: (res) => {
        this.users = res.users || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[UserManagement] Failed to fetch users:', err);
        this.error = 'Failed to load registered users. Please verify Administrator authorization.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredUsers(): UserRow[] {
    return this.users.filter((user) => {
      const matchRole = this.selectedRoleFilter === 'All Roles' || user.role === this.selectedRoleFilter;
      const q = this.searchQuery.toLowerCase().trim();
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      const org = (user.organization || '').toLowerCase();
      const matchQ = !q || fullName.includes(q) || email.includes(q) || org.includes(q);
      return matchRole && matchQ;
    });
  }

  get totalUsersCount(): number {
    return this.users.length;
  }

  get citizenCount(): number {
    return this.users.filter(u => u.role === 'Citizen').length;
  }

  get officialCount(): number {
    return this.users.filter(u => u.role === 'Government Official').length;
  }

  get adminCount(): number {
    return this.users.filter(u => u.role === 'Administrator').length;
  }

  onRoleChange(user: UserRow, newRole: string): void {
    if (!newRole || newRole === user.role) return;
    this.auth.updateUserRole(user._id, newRole).subscribe({
      next: (res) => {
        user.role = res.user.role;
        this.showToast(`Updated ${user.firstName}'s role to "${newRole}"`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to update user role.');
        this.loadUsers();
      }
    });
  }

  toggleStatus(user: UserRow): void {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    this.auth.updateUserStatus(user._id, newStatus).subscribe({
      next: (res) => {
        user.status = res.user.status;
        this.showToast(`${user.firstName} is now ${newStatus}`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to update user status.');
        this.loadUsers();
      }
    });
  }

  setRoleFilter(role: string): void {
    this.selectedRoleFilter = role;
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'Administrator': return 'badge-admin';
      case 'Government Official': return 'badge-govt';
      case 'Researcher': return 'badge-researcher';
      case 'Organization': return 'badge-org';
      default: return 'badge-citizen';
    }
  }

  getInitials(user: UserRow): string {
    const f = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
    const l = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
    return (f + l) || 'U';
  }

  showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }
}
