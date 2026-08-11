import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StatsService } from '../services/stats.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-department-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './department-analytics.component.html',
  styleUrl: './department-analytics.component.css'
})
export class DepartmentAnalyticsComponent implements OnInit {
  officialName = '';
  department = '';
  loading = true;
  searchFilter = '';
  selectedFilter = 'All';

  summary = {
    totalDepartments: 0,
    totalPolicies: 0,
    totalSchemes: 0,
    totalApplications: 0,
    averageSlaDays: 4.2,
  };

  departments: {
    department: string;
    policies: number;
    schemes: number;
    applications: number;
    approved: number;
    pending: number;
    avgSlaDays: number;
    approvalRate: number;
    status: string;
  }[] = [];

  stateDistribution: { state: string; count: number }[] = [];

  constructor(
    private statsService: StatsService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.officialName = this.auth.getUserDisplayName();
    this.department = user?.organization || 'Government of India';
    this.loadDepartmentAnalytics();
  }

  loadDepartmentAnalytics(): void {
    this.loading = true;
    this.statsService.getDepartmentAnalytics().subscribe({
      next: (res) => {
        if (res && res.summary) {
          this.summary = { ...this.summary, ...res.summary };
        }
        if (res && res.departments && res.departments.length) {
          this.departments = res.departments;
        } else {
          this.departments = [
            { department: 'Ministry of Agriculture & Farmers Welfare', policies: 12, schemes: 8, applications: 145, approved: 120, pending: 25, avgSlaDays: 3, approvalRate: 83, status: 'Optimal' },
            { department: 'Ministry of Education', policies: 10, schemes: 6, applications: 98, approved: 80, pending: 18, avgSlaDays: 4, approvalRate: 82, status: 'Optimal' },
            { department: 'Ministry of Rural Development', policies: 8, schemes: 5, applications: 210, approved: 175, pending: 35, avgSlaDays: 5, approvalRate: 83, status: 'Attention Needed' },
            { department: 'Ministry of Finance & Social Welfare', policies: 15, schemes: 9, applications: 310, approved: 280, pending: 30, avgSlaDays: 3, approvalRate: 90, status: 'Optimal' },
          ];
        }

        if (res && res.stateDistribution && res.stateDistribution.length) {
          this.stateDistribution = res.stateDistribution;
        } else {
          this.stateDistribution = [
            { state: 'Maharashtra', count: 42 },
            { state: 'Uttar Pradesh', count: 38 },
            { state: 'Karnataka', count: 29 },
            { state: 'Tamil Nadu', count: 24 },
            { state: 'Gujarat', count: 20 },
            { state: 'Delhi NCR', count: 18 }
          ];
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[DepartmentAnalytics] Error loading data:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredDepartments() {
    return this.departments.filter(d => {
      const matchesSearch = !this.searchFilter || d.department.toLowerCase().includes(this.searchFilter.toLowerCase());
      const matchesFilter = this.selectedFilter === 'All' ||
        (this.selectedFilter === 'Optimal' && d.status === 'Optimal') ||
        (this.selectedFilter === 'Attention' && d.status === 'Attention Needed');
      return matchesSearch && matchesFilter;
    });
  }

  printPage(): void {
    window.print();
  }
}
