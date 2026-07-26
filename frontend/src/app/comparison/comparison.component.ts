import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SchemeService } from '../services/scheme.service';
import { NotificationService } from '../services/notification.service';
import { Scheme, EligibilityRule } from '../models/policy.model';
import { getCategoryIcon, getLaunchYear } from '../utils/helpers';

interface SchemeCol {
  id: string;
  name: string;
  icon: string;
  ministry: string;
  launchYear: string;
  benefit: string;
  target: string;
  incomeLimit: string;
  applicationMode: string;
  status: string;
  eligible: boolean;
}

@Component({
  selector: 'app-comparison',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './comparison.component.html',
  styleUrl: './comparison.component.css'
})
export class ComparisonComponent implements OnInit {
  schemes: SchemeCol[] = [];
  allSchemes: Scheme[] = [];
  selectedIds: string[] = [];
  showPicker = false;
  loading = true;
  notifications: { _id: string }[] = [];
  userName = '';
  userLocation = '';
  userInitials = '';

  constructor(
    private auth: AuthService,
    private schemeService: SchemeService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.userName = this.auth.getUserDisplayName();
    this.userLocation = this.auth.getUserSubtitle();
    this.userInitials = this.auth.getUserInitials();
    this.schemeService.getAll({ status: 'Active' }).subscribe({
      next: (res) => {
        this.allSchemes = res.schemes;
        const defaultIds = res.schemes.slice(0, 3).map((s) => s._id);
        this.loadComparison(defaultIds);
      },
      error: () => { this.loading = false; }
    });
    this.notificationService.getAll().subscribe({
      next: (res) => { this.notifications = res.notifications.filter(n => !n.read); },
      error: () => { this.notifications = []; }
    });
  }

  loadComparison(ids: string[]): void {
    if (ids.length === 0) {
      this.schemes = [];
      this.loading = false;
      return;
    }
    this.loading = true;
    this.schemeService.compare(ids).subscribe({
      next: (res) => {
        this.schemes = res.schemes.map((s) => {
          const rule: EligibilityRule | undefined = res.rules[s._id];
          return {
            id: s._id,
            name: s.name,
            icon: getCategoryIcon(s.category),
            ministry: s.ministry || 'Government of India',
            launchYear: getLaunchYear(s.launchDate),
            benefit: s.benefits?.[0] || s.summary || 'N/A',
            target: s.eligibilityCriteria?.[0] || 'See eligibility',
            incomeLimit: rule?.incomeLimit || 'Any',
            applicationMode: s.applicationMode || 'Online',
            status: s.status,
            eligible: true,
          };
        });
        this.selectedIds = ids;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  addScheme(): void {
    this.showPicker = !this.showPicker;
  }

  toggleScheme(id: string): void {
    const idx = this.selectedIds.indexOf(id);
    if (idx >= 0) {
      this.selectedIds.splice(idx, 1);
    } else if (this.selectedIds.length < 4) {
      this.selectedIds.push(id);
    }
    this.loadComparison([...this.selectedIds]);
  }

  isSelected(id: string): boolean {
    return this.selectedIds.includes(id);
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}