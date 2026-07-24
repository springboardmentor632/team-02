import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

interface RoleStat { role: string; percent: number; count: string; }
interface PolicySubmission { name: string; ministry: string; status: 'Pending' | 'Approved' | 'Review'; }

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  constructor(private router: Router) {}

  stats = [
    { label: 'Total Users', value: '5.2M', sub: '↑ 12% MoM' },
    { label: 'Active Policies', value: '12,480', sub: '↑ 68 new' },
    { label: 'Live Schemes', value: '3,820', sub: '↑ 12 new' },
    { label: 'Searches / Month', value: '1.8M', sub: '↑ 24%' },
    { label: 'Pending Approvals', value: '342', sub: '▲ 18 urgent', danger: true }
  ];

  roleStats: RoleStat[] = [
    { role: 'Citizens', percent: 92, count: '4.8M (92%)' },
    { role: 'Researchers', percent: 5.4, count: '280K (5.4%)' },
    { role: 'Organisations', percent: 1.8, count: '96K (1.8%)' },
    { role: 'Govt Officials', percent: 0.8, count: '44K (0.8%)' }
  ];

  submissions: PolicySubmission[] = [
    { name: 'Digital India 3.0', ministry: 'MeitY', status: 'Pending' },
    { name: 'Solar Rooftop Scheme', ministry: 'MNRE', status: 'Approved' },
    { name: 'EV Adoption Policy', ministry: 'NITI Aayog', status: 'Approved' },
    { name: 'Skill India 2.0', ministry: 'MSDE', status: 'Pending' },
    { name: 'Jal Jeevan Mission II', ministry: 'Jal Shakti', status: 'Review' }
  ];

  onLogout(): void {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      this.router.navigate(['/login']);
    }
  }
}