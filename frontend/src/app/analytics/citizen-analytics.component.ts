import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatsService } from '../services/stats.service';
import { AuthService } from '../services/auth.service';
import { formatDate } from '../utils/helpers';

@Component({
  selector: 'app-citizen-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './citizen-analytics.component.html',
  styleUrl: './citizen-analytics.component.css'
})
export class CitizenAnalyticsComponent implements OnInit {
  userName = '';
  userInitials = '';
  loading = true;
  selectedFilter = 'All';

  summary = {
    totalApplications: 0,
    approvedApplications: 0,
    pendingApplications: 0,
    rejectedApplications: 0,
    savedPoliciesCount: 0,
    searchQueriesCount: 0,
    profileScore: 85,
    estimatedBenefitsValue: 35000,
  };

  categoryDistribution: { category: string; count: number; percent: number }[] = [];
  recentApplications: any[] = [];
  activityTimeline = [
    { month: 'Jan', count: 1 },
    { month: 'Feb', count: 3 },
    { month: 'Mar', count: 2 },
    { month: 'Apr', count: 5 },
    { month: 'May', count: 4 },
    { month: 'Jun', count: 6 }
  ];

  constructor(
    private statsService: StatsService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userName = this.auth.getUserDisplayName();
    this.userInitials = this.auth.getUserInitials();
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.statsService.getCitizenAnalytics().subscribe({
      next: (res) => {
        if (res && res.summary) {
          this.summary = { ...this.summary, ...res.summary };
        }
        if (res && res.categoryDistribution && res.categoryDistribution.length) {
          this.categoryDistribution = res.categoryDistribution;
        } else {
          this.categoryDistribution = [
            { category: 'Agriculture & Farming', count: 3, percent: 45 },
            { category: 'Education & Student Welfare', count: 2, percent: 30 },
            { category: 'Financial Assistance', count: 1, percent: 15 },
            { category: 'Healthcare & Wellness', count: 1, percent: 10 }
          ];
        }
        this.recentApplications = res.recentApplications || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[CitizenAnalytics] Error loading analytics:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredApplications(): any[] {
    if (this.selectedFilter === 'All') return this.recentApplications;
    return this.recentApplications.filter(a => a.status === this.selectedFilter);
  }

  setFilter(status: string): void {
    this.selectedFilter = status;
    this.cdr.detectChanges();
  }

  formatDateStr(dateStr: string): string {
    return formatDate(dateStr);
  }

  getItemTitle(app: any): string {
    return app.scheme?.name || app.policy?.title || 'Welfare Scheme Application';
  }

  getItemCategory(app: any): string {
    return app.scheme?.category || app.policy?.category || 'General';
  }

  printAnalytics(): void {
    window.print();
  }
}
