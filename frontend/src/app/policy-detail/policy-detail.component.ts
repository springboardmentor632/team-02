import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PolicyService } from '../services/policy.service';
import { Policy } from '../models/policy.model';
import { formatDate, getLaunchYear } from '../utils/helpers';

@Component({
  selector: 'app-policy-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './policy-detail.component.html',
  styleUrl: './policy-detail.component.css'
})
export class PolicyDetailComponent implements OnInit {
  activeTab: 'overview' | 'eligibility' | 'documents' | 'faq' = 'overview';
  loading = true;
  error = '';
  policy: Policy | null = null;
  saved = false;
  saveLoading = false;

  stats: { value: string; label: string; icon: string }[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private policyService: PolicyService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadPolicy(id);
      } else {
        this.error = 'Policy ID missing';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadPolicy(id: string): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.policyService.getById(id).subscribe({
      next: (res) => {
        this.policy = res.policy;
        this.stats = [
          { value: this.policy.category, label: 'Category', icon: '🏷️' },
          { value: this.policy.state || 'All India', label: 'Scope', icon: '📍' },
          { value: getLaunchYear(this.policy.publishedAt), label: 'Launch Year', icon: '📅' },
          { value: this.policy.status, label: 'Status', icon: '✅' },
        ];
        this.loading = false;
        this.cdr.detectChanges();

        this.policyService.isSaved(id).subscribe({
          next: (savedRes) => {
            this.saved = savedRes.saved;
            this.cdr.detectChanges();
          },
          error: () => {}
        });
      },
      error: (err) => {
        console.error('[PolicyDetail] Error loading policy:', err);
        if (err.status === 401) {
          this.error = 'Session expired. Please log in again.';
        } else if (err.status === 404) {
          this.error = 'This policy could not be found.';
        } else {
          this.error = 'Failed to load policy details. Please try again.';
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get benefits(): string[] {
    if (!this.policy?.tags?.length) return ['See policy overview for details'];
    return this.policy.tags;
  }

  get categoryIcon(): string {
    const icons: Record<string, string> = {
      'Healthcare': '🏥', 'Agriculture': '🌾', 'Education': '📚',
      'Housing': '🏠', 'Employment': '💼', 'Finance': '💰',
      'Digital Governance': '💻', 'Environment': '🌿', 'Women & Child Welfare': '👩‍👧',
      'Infrastructure': '🏗️', 'Defence': '🛡️'
    };
    return icons[this.policy?.category || ''] || '📋';
  }

  formatDate(d?: string): string { return formatDate(d); }
  setTab(tab: typeof this.activeTab): void {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  toggleSave(): void {
    if (!this.policy || this.saveLoading) return;
    this.saveLoading = true;
    this.cdr.detectChanges();

    if (this.saved) {
      this.policyService.unsavePolicy(this.policy._id).subscribe({
        next: () => {
          this.saved = false;
          this.saveLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.saveLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.policyService.savePolicy(this.policy._id).subscribe({
        next: () => {
          this.saved = true;
          this.saveLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.saveLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  goApply(): void {
    if (this.policy) {
      this.router.navigate(['/citizen/policy', this.policy._id, 'apply']);
    }
  }

  retryLoad(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadPolicy(id);
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}
