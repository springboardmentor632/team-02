import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PolicyService } from '../services/policy.service';
import { SchemeService } from '../services/scheme.service';
import { StatsService } from '../services/stats.service';
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
    { label: 'Total Users', value: '—', sub: 'Registered on platform' },
    { label: 'Active Policies', value: '—', sub: 'Published policies' },
    { label: 'Live Schemes', value: '—', sub: 'Active schemes' },
    { label: 'Total Policies', value: '—', sub: 'All statuses' },
    { label: 'Pending Approvals', value: '—', sub: 'Awaiting review', danger: true }
  ];

  submissions: { name: string; ministry: string; status: string }[] = [];
  roleStats: { role: string; percent: number; count: string }[] = [];

  constructor(
    private router: Router,
    private auth: AuthService,
    private policyService: PolicyService,
    private schemeService: SchemeService,
    private statsService: StatsService
  ) {}

  ngOnInit(): void {
    // Use the public stats endpoint as single source of truth for all counts
    this.statsService.getPlatformStats().subscribe({
      next: (res) => {
        this.stats[0].value = res.stats.users.toString();
        this.stats[1].value = res.stats.policies.toString();
        this.stats[2].value = res.stats.schemes.toString();
        this.stats[3].value = (res.stats.totalPolicies ?? res.stats.policies).toString();
        this.stats[4].value = (res.stats.pendingPolicies ?? 0).toString();
        this.roleStats = [
          { role: 'Citizens', percent: 85, count: `${res.stats.users} users` },
          { role: 'Policies', percent: Math.min(res.stats.policies * 10, 100), count: `${res.stats.policies} active` },
          { role: 'Schemes', percent: Math.min(res.stats.schemes * 10, 100), count: `${res.stats.schemes} active` },
        ];
      },
      error: (err) => {
        console.error('Stats load error:', err);
      }
    });

    // Load recent policy submissions for the table
    this.policyService.getAll().subscribe({
      next: (res) => {
        const policies = res.policies;
        this.submissions = policies.slice(0, 5).map((p: Policy) => ({
          name: p.title,
          ministry: p.ministry || 'N/A',
          status: p.status === 'Active' ? 'Approved' : p.status,
        }));
      },
      error: (err) => {
        console.error('Policies load error:', err);
      }
    });
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}
