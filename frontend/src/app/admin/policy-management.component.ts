import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PolicyService } from '../services/policy.service';
import { Policy } from '../models/policy.model';

@Component({
  selector: 'app-policy-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
    private policyService: PolicyService
  ) {}

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.loading = true;
    this.policyService.getAll().subscribe({
      next: (res) => {
        this.policies = res.policies;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load policies.';
        this.loading = false;
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  addPolicy(): void {
    if (!this.newPolicy.title || !this.newPolicy.ministry) return;
    this.policyService.create({
      title: this.newPolicy.title,
      category: this.newPolicy.category,
      ministry: this.newPolicy.ministry,
      summary: this.newPolicy.summary,
      content: this.newPolicy.content || this.newPolicy.summary,
      status: 'Draft',
    }).subscribe({
      next: () => {
        this.newPolicy = { title: '', category: 'Education', ministry: '', summary: '', content: '' };
        this.showForm = false;
        this.loadPolicies();
      },
      error: () => { this.error = 'Failed to create policy.'; }
    });
  }

  approve(p: Policy): void {
    this.policyService.update(p._id, { status: 'Active', publishedAt: new Date().toISOString() }).subscribe({
      next: () => this.loadPolicies(),
      error: () => { this.error = 'Failed to approve policy.'; }
    });
  }

  submitForApproval(p: Policy): void {
    this.policyService.update(p._id, { status: 'Pending' }).subscribe({
      next: () => this.loadPolicies(),
    });
  }

  archive(p: Policy): void {
    this.policyService.update(p._id, { status: 'Archived' }).subscribe({
      next: () => this.loadPolicies(),
      error: () => { this.error = 'Failed to archive policy.'; }
    });
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}
