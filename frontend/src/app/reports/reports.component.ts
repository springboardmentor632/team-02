import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { PolicyService } from '../services/policy.service';
import { SchemeService } from '../services/scheme.service';
import { SearchService } from '../services/search.service';
import { NotificationService } from '../services/notification.service';
import { formatDate } from '../utils/helpers';

interface ReportRow {
  id: string;
  name: string;
  category: string;
  generatedOn: string;
  format: 'PDF' | 'Excel';
  value?: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  userName = '';
  userLocation = '';
  userInitials = '';
  selectedCategory = 'All';
  categories = ['All', 'Policy', 'Scheme', 'Search Activity'];
  generating = false;
  loading = true;

  reports: ReportRow[] = [];
  notifications: { _id: string }[] = [];

  constructor(
    private router: Router,
    private auth: AuthService,
    private policyService: PolicyService,
    private schemeService: SchemeService,
    private searchService: SearchService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.userName = this.auth.getUserDisplayName();
    this.userLocation = this.auth.getUserSubtitle();
    this.userInitials = this.auth.getUserInitials();
    this.loadReports();
    this.notificationService.getAll().subscribe({
      next: (res) => { this.notifications = res.notifications.filter(n => !n.read); },
      error: () => { this.notifications = []; }
    });
  }

  loadReports(): void {
    this.loading = true;
    const today = formatDate(new Date().toISOString());

    forkJoin({
      policies: this.policyService.getAll({ status: 'Active' }),
      schemes: this.schemeService.getAll({ status: 'Active' }),
      history: this.searchService.getHistory(),
    }).subscribe({
      next: ({ policies, schemes, history }) => {
        this.reports = [
          { id: '1', name: 'Active Policies Summary', category: 'Policy', generatedOn: today, format: 'PDF', value: `${policies.policies.length} active policies` },
          { id: '2', name: 'Active Schemes Summary', category: 'Scheme', generatedOn: today, format: 'Excel', value: `${schemes.schemes.length} active schemes` },
          { id: '3', name: 'Your Search Activity', category: 'Search Activity', generatedOn: today, format: 'PDF', value: `${history.history.length} searches recorded` },
        ];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get filteredReports(): ReportRow[] {
    return this.selectedCategory === 'All' ? this.reports : this.reports.filter(r => r.category === this.selectedCategory);
  }

  setCategory(cat: string): void {
    this.selectedCategory = cat;
  }

  generateNewReport(): void {
    this.generating = true;
    this.loadReports();
    setTimeout(() => { this.generating = false; }, 800);
  }

  downloadReport(report: ReportRow): void {
    const content = `PolicyGPT Report\n${report.name}\n${report.value || ''}\nGenerated: ${report.generatedOn}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}