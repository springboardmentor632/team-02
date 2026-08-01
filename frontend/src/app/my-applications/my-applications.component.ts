import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { ApplicationService } from '../services/application.service';
import { SchemeApplication, Scheme, Policy } from '../models/policy.model';
import { formatDate } from '../utils/helpers';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './my-applications.component.html',
  styleUrl: './my-applications.component.css',
})
export class MyApplicationsComponent implements OnInit {
  applications: SchemeApplication[] = [];
  filteredApplications: SchemeApplication[] = [];
  loading = true;
  error = '';
  activeFilter: 'all' | 'policy' | 'scheme' | 'Approved' | 'Under Review' = 'all';

  constructor(
    private applicationService: ApplicationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.applicationService.getMine().subscribe({
      next: (res) => {
        this.applications = res.applications || [];
        this.applyFilter('all');
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load your applications.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilter(filter: typeof this.activeFilter): void {
    this.activeFilter = filter;
    if (filter === 'all') {
      this.filteredApplications = [...this.applications];
    } else if (filter === 'policy' || filter === 'scheme') {
      this.filteredApplications = this.applications.filter(
        (app) => (app.applicationType || 'scheme') === filter
      );
    } else {
      this.filteredApplications = this.applications.filter(
        (app) => app.status === filter
      );
    }
    this.cdr.detectChanges();
  }

  schemeName(app: SchemeApplication): string {
    if (app.applicationType === 'policy' && app.policy && typeof app.policy === 'object') {
      return (app.policy as Policy).title || 'Policy Application';
    }
    const scheme = app.scheme as Scheme;
    return typeof scheme === 'object' && scheme?.name ? scheme.name : 'Scheme Application';
  }

  schemeCategory(app: SchemeApplication): string {
    if (app.applicationType === 'policy' && app.policy && typeof app.policy === 'object') {
      return (app.policy as Policy).category || 'Policy';
    }
    const scheme = app.scheme as Scheme;
    return typeof scheme === 'object' && scheme?.category ? scheme.category : 'General';
  }

  schemeMinistry(app: SchemeApplication): string {
    if (app.applicationType === 'policy' && app.policy && typeof app.policy === 'object') {
      return (app.policy as Policy).ministry || 'Government of India';
    }
    const scheme = app.scheme as Scheme;
    return typeof scheme === 'object' && scheme?.ministry ? scheme.ministry : 'Government of India';
  }

  schemeId(app: SchemeApplication): string {
    if (app.applicationType === 'policy') {
      if (app.policy && typeof app.policy === 'object') {
        return (app.policy as Policy)._id;
      }
      return String(app.policy);
    }
    const scheme = app.scheme as Scheme;
    return typeof scheme === 'object' && scheme?._id ? scheme._id : String(app.scheme);
  }

  formatDate(d?: string): string {
    return formatDate(d);
  }

  statusClass(status: string): string {
    switch (status) {
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      case 'Under Review': return 'status-review';
      default: return 'status-submitted';
    }
  }

  statusIcon(status: string): string {
    switch (status) {
      case 'Approved': return '✅';
      case 'Rejected': return '❌';
      case 'Under Review': return '⏳';
      default: return '📩';
    }
  }
}
