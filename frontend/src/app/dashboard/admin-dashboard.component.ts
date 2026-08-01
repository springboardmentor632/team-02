import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PolicyService } from '../services/policy.service';
import { SchemeService } from '../services/scheme.service';
import { StatsService } from '../services/stats.service';
import { ApplicationService } from '../services/application.service';
import { Policy } from '../models/policy.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  stats = [
    { label: 'Total Users', value: '—', sub: 'Registered on platform', danger: false },
    { label: 'Active Policies', value: '—', sub: 'Published policies', danger: false },
    { label: 'Live Schemes', value: '—', sub: 'Active schemes', danger: false },
    { label: 'Total Policies', value: '—', sub: 'All statuses', danger: false },
    { label: 'Pending Approvals', value: '—', sub: 'Awaiting review', danger: true }
  ];

  submissions: { name: string; ministry: string; status: string }[] = [];
  roleStats: { role: string; percent: number; count: string }[] = [];

  constructor(
    private router: Router,
    private auth: AuthService,
    private policyService: PolicyService,
    private schemeService: SchemeService,
    private statsService: StatsService,
    private applicationService: ApplicationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.statsService.getPlatformStats().subscribe({
      next: (res) => {
        if (!res || !res.stats) return;
        const s = res.stats;
        // Replace entire array to guarantee change detection
        this.stats = [
          { label: 'Total Users', value: String(s.users), sub: 'Registered on platform', danger: false },
          { label: 'Active Policies', value: String(s.policies), sub: 'Published policies', danger: false },
          { label: 'Live Schemes', value: String(s.schemes), sub: 'Active schemes', danger: false },
          { label: 'Total Policies', value: String(s.totalPolicies ?? s.policies), sub: 'All statuses', danger: false },
          { label: 'Pending Approvals', value: String(s.pendingPolicies ?? 0), sub: 'Awaiting review', danger: true },
        ];
        this.roleStats = [
          { role: 'Citizens', percent: 85, count: `${s.users} users` },
          { role: 'Policies', percent: Math.min(s.policies * 4, 100), count: `${s.policies} active` },
          { role: 'Schemes', percent: Math.min(s.schemes * 6, 100), count: `${s.schemes} active` },
        ];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('[AdminDashboard] Stats error:', err)
    });

    this.policyService.getAll().subscribe({
      next: (res) => {
        const policies = res.policies || [];
        this.submissions = policies.slice(0, 5).map((p: Policy) => ({
          name: p.title,
          ministry: p.ministry || 'N/A',
          status: p.status === 'Active' ? 'Approved' : p.status,
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('[AdminDashboard] Policies error:', err)
    });

    this.applicationService.getAll().subscribe({
      next: (res) => {
        const apps = res.applications || [];
        const pending = apps.filter(a => a.status === 'Submitted' || a.status === 'Under Review').length;
        // update pending approvals stat
        this.stats = this.stats.map((s, i) => i === 4 ? { ...s, value: String(pending) } : s);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('[AdminDashboard] Applications error:', err)
    });
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}
