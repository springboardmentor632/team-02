import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface DeptReport { dept: string; policies: number; applications: number; status: 'On Track' | 'Delayed'; }

@Component({
  selector: 'app-government-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './government-dashboard.component.html',
  styleUrl: './government-dashboard.component.css'
})
export class GovernmentDashboardComponent {
  officialName = 'Priya Verma';
  department = 'Ministry of Rural Development';

  stats = [
    { label: 'Policies Published', value: '86', sub: '↑ 4 this quarter' },
    { label: 'Active Schemes', value: '32', sub: '3 pending approval' },
    { label: 'Total Applications', value: '2.4M', sub: '↑ 8% this month' },
    { label: 'Notifications Sent', value: '145K', sub: 'Last 30 days' }
  ];

  // Scheme Usage Analytics
  schemeUsage = [
    { name: 'PM Kisan Samman Nidhi', usage: 92 },
    { name: 'MGNREGA', usage: 78 },
    { name: 'PM Awas Yojana', usage: 65 },
    { name: 'Jal Jeevan Mission', usage: 54 }
  ];

  // User Activity (weekly)
  userActivity = [
    { day: 'Mon', value: 62 },
    { day: 'Tue', value: 74 },
    { day: 'Wed', value: 58 },
    { day: 'Thu', value: 85 },
    { day: 'Fri', value: 70 },
    { day: 'Sat', value: 40 },
    { day: 'Sun', value: 30 }
  ];

  deptReports: DeptReport[] = [
    { dept: 'Rural Development', policies: 18, applications: 620000, status: 'On Track' },
    { dept: 'Agriculture', policies: 12, applications: 480000, status: 'On Track' },
    { dept: 'Health & Family Welfare', policies: 9, applications: 310000, status: 'Delayed' },
    { dept: 'Education', policies: 15, applications: 275000, status: 'On Track' }
  ];

  notifStats = [
    { channel: 'Email', sent: '68K', delivered: '96%' },
    { channel: 'SMS', sent: '52K', delivered: '91%' },
    { channel: 'In-App', sent: '25K', delivered: '99%' }
  ];
}