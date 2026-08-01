import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PolicyService } from '../services/policy.service';
import { SchemeService } from '../services/scheme.service';
import { NotificationService } from '../services/notification.service';
import { StatsService } from '../services/stats.service';
import { ApplicationService } from '../services/application.service';

@Component({
  selector: 'app-government-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './government-dashboard.component.html',
  styleUrl: './government-dashboard.component.css'
})
export class GovernmentDashboardComponent implements OnInit {
  officialName = '';
  department = '';

  stats = [
    { label: 'Policies Published', value: '—', sub: 'Active policies' },
    { label: 'Active Schemes', value: '—', sub: 'Live on platform' },
    { label: 'Pending Policies', value: '—', sub: 'Awaiting approval' },
    { label: 'Notifications', value: '—', sub: 'Platform alerts' }
  ];

  schemeUsage: { name: string; usage: number }[] = [];
  deptReports: { dept: string; policies: number; applications: number; status: string }[] = [];
  userActivity = [
    { day: 'Mon', value: 40 }, { day: 'Tue', value: 55 }, { day: 'Wed', value: 48 },
    { day: 'Thu', value: 62 }, { day: 'Fri', value: 50 }, { day: 'Sat', value: 30 }, { day: 'Sun', value: 25 }
  ];
  notifStats: { channel: string; sent: string; delivered: string }[] = [];

  constructor(
    private router: Router,
    private auth: AuthService,
    private policyService: PolicyService,
    private schemeService: SchemeService,
    private notificationService: NotificationService,
    private statsService: StatsService,
    private applicationService: ApplicationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.officialName = this.auth.getUserDisplayName();
    this.department = user?.organization || 'Government of India';

    // Replace entire stats array on load from public endpoint (no 304 cache issue)
    this.statsService.getPlatformStats().subscribe({
      next: (res) => {
        if (!res || !res.stats) return;
        const s = res.stats;
        this.stats = [
          { label: 'Policies Published', value: String(s.policies), sub: 'Active policies' },
          { label: 'Active Schemes', value: String(s.schemes), sub: 'Live on platform' },
          { label: 'Pending Policies', value: String(s.pendingPolicies ?? 0), sub: 'Awaiting approval' },
          { label: 'Notifications', value: '—', sub: 'Platform alerts' }
        ];
        this.roleStats = [
          { role: 'Policies', percent: Math.min(s.policies * 4, 100), count: `${s.policies} active` },
          { role: 'Schemes', percent: Math.min(s.schemes * 6, 100), count: `${s.schemes} active` },
          { role: 'Pending', percent: Math.min((s.pendingPolicies ?? 0) * 10, 100), count: `${s.pendingPolicies ?? 0} pending` },
        ];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('[GovtDashboard] Stats error:', err)
    });

    this.policyService.getAll({ status: 'Active' }).subscribe({
      next: (res) => {
        const deptMap: Record<string, number> = {};
        (res.policies || []).forEach((p) => {
          const dept = p.department || p.ministry || 'Other';
          deptMap[dept] = (deptMap[dept] || 0) + 1;
        });
        this.deptReports = Object.entries(deptMap).map(([dept, count]) => ({
          dept,
          policies: count,
          applications: 0,
          status: 'On Track',
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('[GovtDashboard] Policies error:', err)
    });

    this.schemeService.getAll({ status: 'Active' }).subscribe({
      next: (res) => {
        const schemes = res.schemes || [];
        const max = schemes.length || 1;
        this.schemeUsage = schemes.slice(0, 4).map((s, i) => ({
          name: s.name,
          usage: Math.round(((max - i) / max) * 100),
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('[GovtDashboard] Schemes error:', err)
    });

    this.notificationService.getAll().subscribe({
      next: (res) => {
        const total = (res.notifications || []).length;
        const unread = (res.notifications || []).filter(n => !n.read).length;
        this.stats = this.stats.map((s, i) =>
          i === 3 ? { ...s, value: String(total) } : s
        );
        this.notifStats = [
          { channel: 'In-App', sent: String(total), delivered: '100%' },
          { channel: 'Platform Alerts', sent: String(total), delivered: `${unread} unread` },
        ];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[GovtDashboard] Notifications error:', err);
        this.stats = this.stats.map((s, i) => i === 3 ? { ...s, value: '0' } : s);
        this.cdr.detectChanges();
      }
    });

    // also fetch application counts for government dashboard overview
    this.applicationService.getAll().subscribe({
      next: (res) => {
        const apps = res.applications || [];
        this.stats = this.stats.map((s, i) => i === 3 ? { ...s, value: String(apps.length) } : s);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[GovtDashboard] Applications error:', err);
      }
    });
  }

  roleStats: { role: string; percent: number; count: string }[] = [];

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}
