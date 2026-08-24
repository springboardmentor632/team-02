import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PolicyService } from '../services/policy.service';
import { SchemeService } from '../services/scheme.service';
import { StatsService } from '../services/stats.service';
import { ApplicationService } from '../services/application.service';
import { Policy, SchemeApplication } from '../models/policy.model';

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
    { label: 'Pending Applications', value: '—', sub: 'Awaiting review', danger: true }
  ];

  submissions: { name: string; ministry: string; status: string }[] = [];
  roleStats: { role: string; percent: number; count: string }[] = [];
  applications: SchemeApplication[] = [];
  loadingApps = false;

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
        this.stats = [
          { label: 'Total Users', value: String(s.users), sub: 'Registered on platform', danger: false },
          { label: 'Active Policies', value: String(s.policies), sub: 'Published policies', danger: false },
          { label: 'Live Schemes', value: String(s.schemes), sub: 'Active schemes', danger: false },
          { label: 'Total Policies', value: String(s.totalPolicies ?? s.policies), sub: 'All statuses', danger: false },
          { label: 'Pending Applications', value: String(s.pendingPolicies ?? 0), sub: 'Awaiting review', danger: true },
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

    this.loadApplications();
  }

  loadApplications(): void {
    this.loadingApps = true;
    this.applicationService.getAll().subscribe({
      next: (res) => {
        this.applications = res.applications || [];
        this.loadingApps = false;
        const pending = this.applications.filter(a => a.status === 'Submitted' || a.status === 'Under Review').length;
        this.stats = this.stats.map((s, i) => i === 4 ? { ...s, value: String(pending) } : s);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[AdminDashboard] Applications error:', err);
        this.loadingApps = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateApplicationStatus(app: SchemeApplication, status: 'Approved' | 'Rejected'): void {
    const actionLabel = status === 'Approved' ? 'Accept / Approve' : 'Reject';
    const note = prompt(`Enter optional official note for making this application "${actionLabel}":`) ?? '';
    this.applicationService.updateStatus(app._id, status, note).subscribe({
      next: () => {
        app.status = status;
        app.govNotes = note;
        this.loadApplications();
      },
      error: (err) => alert(err?.error?.message || 'Failed to update application status')
    });
  }

  getItemTitle(app: any): string {
    if (app.applicationType === 'policy' && app.policy && typeof app.policy === 'object') {
      return app.policy.title || 'Policy Application';
    }
    if (app.scheme && typeof app.scheme === 'object') {
      return app.scheme.name || 'Scheme Application';
    }
    return 'Application';
  }

  getApplicantName(app: any): string {
    if (app.applicantName) return app.applicantName;
    if (app.user && typeof app.user === 'object') {
      return `${app.user.firstName || ''} ${app.user.lastName || ''}`.trim() || app.user.email || 'Citizen';
    }
    return 'Citizen Applicant';
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}
