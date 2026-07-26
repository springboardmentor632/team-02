import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SchemeService } from '../services/scheme.service';
import { Scheme } from '../models/policy.model';
import { formatDate, getLaunchYear } from '../utils/helpers';

@Component({
  selector: 'app-scheme-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './scheme-detail.component.html',
  styleUrl: './scheme-detail.component.css'
})
export class SchemeDetailComponent implements OnInit {
  activeTab: 'overview' | 'eligibility' | 'benefits' | 'documents' = 'overview';
  loading = true;
  error = '';
  scheme: Scheme | null = null;
  stats: { value: string; label: string }[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private schemeService: SchemeService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Scheme not found';
      this.loading = false;
      return;
    }
    this.schemeService.getById(id).subscribe({
      next: (res) => {
        this.scheme = res.scheme;
        this.stats = [
          { value: this.scheme.benefits?.[0] || 'See benefits', label: 'Key Benefit' },
          { value: this.scheme.category, label: 'Category' },
          { value: getLaunchYear(this.scheme.launchDate), label: 'Launch Year' },
          { value: this.scheme.status, label: 'Status' },
        ];
        this.loading = false;
      },
      error: () => {
        this.error = 'Scheme not found or failed to load.';
        this.loading = false;
      }
    });
  }

  formatDate(d?: string): string {
    return formatDate(d);
  }

  setTab(tab: typeof this.activeTab): void {
    this.activeTab = tab;
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}
