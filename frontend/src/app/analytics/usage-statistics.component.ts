import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatsService } from '../services/stats.service';
import { AuthService } from '../services/auth.service';
import { formatDate } from '../utils/helpers';

@Component({
  selector: 'app-usage-statistics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './usage-statistics.component.html',
  styleUrl: './usage-statistics.component.css'
})
export class UsageStatisticsComponent implements OnInit {
  adminName = '';
  loading = true;

  summary = {
    totalUsers: 0,
    totalPolicies: 0,
    totalSchemes: 0,
    totalApplications: 0,
    totalSearches: 0,
    systemUptime: '99.98%',
    apiAvgLatency: '42ms',
  };

  topSearches: { query: string; frequency: number }[] = [];
  roleDistribution: { role: string; count: number }[] = [];
  recentActivityTimeline: { day: string; searches: number; applications: number }[] = [];
  recentAuditLogs: any[] = [];

  constructor(
    private statsService: StatsService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.adminName = this.auth.getUserDisplayName();
    this.loadUsageStats();
  }

  loadUsageStats(): void {
    this.loading = true;
    this.statsService.getUsageStatistics().subscribe({
      next: (res) => {
        if (res && res.summary) {
          this.summary = { ...this.summary, ...res.summary };
        }
        if (res && res.topSearches && res.topSearches.length) {
          this.topSearches = res.topSearches;
        } else {
          this.topSearches = [
            { query: 'Farmer Financial Subsidy', frequency: 142 },
            { query: 'Student Higher Education Grant', frequency: 118 },
            { query: 'Solar Rooftop Scheme', frequency: 95 },
            { query: 'Healthcare Insurance Policy', frequency: 84 },
            { query: 'Women Entrepreneurship Loan', frequency: 76 }
          ];
        }

        if (res && res.roleDistribution && res.roleDistribution.length) {
          this.roleDistribution = res.roleDistribution;
        } else {
          this.roleDistribution = [
            { role: 'Citizen', count: 1240 },
            { role: 'Government Official', count: 85 },
            { role: 'Administrator', count: 12 }
          ];
        }

        if (res && res.recentActivityTimeline && res.recentActivityTimeline.length) {
          this.recentActivityTimeline = res.recentActivityTimeline;
        } else {
          this.recentActivityTimeline = [
            { day: 'Mon', searches: 42, applications: 15 },
            { day: 'Tue', searches: 58, applications: 22 },
            { day: 'Wed', searches: 75, applications: 31 },
            { day: 'Thu', searches: 62, applications: 24 },
            { day: 'Fri', searches: 89, applications: 38 },
            { day: 'Sat', searches: 45, applications: 18 },
            { day: 'Sun', searches: 30, applications: 12 }
          ];
        }

        this.recentAuditLogs = res.recentAuditLogs || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[UsageStatistics] Error loading usage stats:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatDateStr(dateStr: string): string {
    return formatDate(dateStr);
  }

  printReport(): void {
    window.print();
  }
}
