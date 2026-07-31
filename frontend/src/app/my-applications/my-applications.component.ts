import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApplicationService } from '../services/application.service';
import { SchemeApplication, Scheme } from '../models/policy.model';
import { formatDate } from '../utils/helpers';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-applications.component.html',
  styleUrl: './my-applications.component.css',
})
export class MyApplicationsComponent implements OnInit {
  applications: SchemeApplication[] = [];
  loading = true;
  error = '';

  constructor(private applicationService: ApplicationService) {}

  ngOnInit(): void {
    this.applicationService.getMine().subscribe({
      next: (res) => {
        this.applications = res.applications;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load your applications.';
        this.loading = false;
      },
    });
  }

  schemeName(app: SchemeApplication): string {
    const scheme = app.scheme as Scheme;
    return typeof scheme === 'object' && scheme?.name ? scheme.name : 'Unknown Scheme';
  }

  schemeCategory(app: SchemeApplication): string {
    const scheme = app.scheme as Scheme;
    return typeof scheme === 'object' && scheme?.category ? scheme.category : '';
  }

  schemeId(app: SchemeApplication): string {
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
}
