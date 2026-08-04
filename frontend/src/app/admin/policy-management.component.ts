import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PolicyService } from '../services/policy.service';
import { Policy } from '../models/policy.model';

@Component({
  selector: 'app-policy-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './policy-management.component.html',
  styleUrl: './policy-management.component.css'
})
export class PolicyManagementComponent implements OnInit {
  showForm = false;
  loading = true;
  error = '';

  newPolicy = { title: '', category: 'Education', ministry: '', summary: '', content: '' };
  categories = ['Education', 'Healthcare', 'Agriculture', 'Employment', 'Finance', 'Women & Child Welfare', 'Housing', 'Environment', 'Digital Governance', 'Infrastructure'];

  policies: Policy[] = [];

  constructor(
    private router: Router,
    private auth: AuthService,
    private policyService: PolicyService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.policyService.getAll().subscribe({
      next: (res) => {
        this.policies = res.policies || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load policies.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.cdr.detectChanges();
  }

  addPolicy(): void {
    if (!this.newPolicy.title || !this.newPolicy.ministry) return;
    this.policyService.create({
      title: this.newPolicy.title,
      category: this.newPolicy.category,
      ministry: this.newPolicy.ministry,
      summary: this.newPolicy.summary,
      content: this.newPolicy.content || this.newPolicy.summary,
      status: 'Active',
      publishedAt: new Date().toISOString(),
    }).subscribe({
      next: () => {
        this.newPolicy = { title: '', category: 'Education', ministry: '', summary: '', content: '' };
        this.showForm = false;
        this.loadPolicies();
      },
      error: () => {
        this.error = 'Failed to create policy.';
        this.cdr.detectChanges();
      }
    });
  }

  approve(p: Policy): void {
    this.policyService.approvePolicy(p._id).subscribe({
      next: () => {
        p.status = 'Active';
        this.loadPolicies();
      },
      error: () => {
        this.error = 'Failed to approve policy.';
        this.cdr.detectChanges();
      }
    });
  }

  reject(p: Policy): void {
    this.policyService.rejectPolicy(p._id).subscribe({
      next: () => {
        p.status = 'Archived';
        this.loadPolicies();
      },
      error: () => {
        this.error = 'Failed to reject policy.';
        this.cdr.detectChanges();
      }
    });
  }

  deletePolicy(p: Policy): void {
    if (!confirm(`Are you sure you want to delete policy "${p.title}"?`)) return;
    this.policyService.delete(p._id).subscribe({
      next: () => this.loadPolicies(),
      error: () => {
        this.error = 'Failed to delete policy.';
        this.cdr.detectChanges();
      }
    });
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}
