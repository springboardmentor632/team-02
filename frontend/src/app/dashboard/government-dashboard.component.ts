import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PolicyService } from '../services/policy.service';
import { SchemeService } from '../services/scheme.service';
import { NotificationService } from '../services/notification.service';

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
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.officialName = this.auth.getUserDisplayName();
    this.department = user?.organization || 'Government of India';

    this.policyService.getAll({ status: 'Active' }).subscribe({
      next: (res) => {
        this.stats[0].value = res.policies.length.toString();
        const deptMap: Record<string, number> = {};
        res.policies.forEach((p) => {
          const dept = p.department || p.ministry || 'Other';
          deptMap[dept] = (deptMap[dept] || 0) + 1;
        });
        this.deptReports = Object.entries(deptMap).map(([dept, count]) => ({
          dept,
          policies: count,
          applications: 0,
          status: 'On Track',
        }));
      }
    });

    this.schemeService.getAll({ status: 'Active' }).subscribe({
      next: (res) => {
        this.stats[1].value = res.schemes.length.toString();
        const max = res.schemes.length || 1;
        this.schemeUsage = res.schemes.slice(0, 4).map((s, i) => ({
          name: s.name,
          usage: Math.round(((max - i) / max) * 100),
        }));
      }
    });

    this.policyService.getAll({ status: 'Pending' }).subscribe({
      next: (res) => {
        this.stats[2].value = res.policies.length.toString();
      }
    });

    this.notificationService.getAll().subscribe({
      next: (res) => {
        this.stats[3].value = res.notifications.length.toString();
        const total = res.notifications.length;
        this.notifStats = [
          { channel: 'In-App', sent: total.toString(), delivered: '100%' },
          { channel: 'Platform Alerts', sent: total.toString(), delivered: `${res.notifications.filter(n => !n.read).length} unread` },
        ];
      }
    });
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}
