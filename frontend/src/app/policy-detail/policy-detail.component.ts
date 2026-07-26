import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PolicyService } from '../services/policy.service';
import { Policy } from '../models/policy.model';
import { formatDate, getLaunchYear } from '../utils/helpers';

@Component({
  selector: 'app-policy-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './policy-detail.component.html',
  styleUrl: './policy-detail.component.css'
})
export class PolicyDetailComponent implements OnInit {
  activeTab: 'overview' | 'eligibility' | 'apply' | 'documents' | 'faq' = 'overview';
  loading = true;
  error = '';
  policy: Policy | null = null;

  stats: { value: string; label: string }[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private policyService: PolicyService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Policy not found';
      this.loading = false;
      return;
    }
    this.policyService.getById(id).subscribe({
      next: (res) => {
        this.policy = res.policy;
        this.stats = [
          { value: this.policy.category, label: 'Category' },
          { value: this.policy.state || 'All India', label: 'Scope' },
          { value: getLaunchYear(this.policy.publishedAt), label: 'Launch Year' },
          { value: this.policy.status, label: 'Status' },
        ];
        this.loading = false;
      },
      error: () => {
        this.error = 'Policy not found or failed to load.';
        this.loading = false;
      }
    });
  }

  get benefits(): string[] {
    if (!this.policy?.tags?.length) return ['See policy overview for details'];
    return this.policy.tags;
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
