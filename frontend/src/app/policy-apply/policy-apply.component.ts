import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PolicyService } from '../services/policy.service';
import { ApplicationService } from '../services/application.service';
import { Policy } from '../models/policy.model';
import { formatDate } from '../utils/helpers';

@Component({
  selector: 'app-policy-apply',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './policy-apply.component.html',
  styleUrl: './policy-apply.component.css'
})
export class PolicyApplyComponent implements OnInit {
  policyId = '';
  policy: Policy | null = null;
  loading = true;
  submitting = false;
  submitted = false;
  error = '';

  // User Info
  applicantName = '';
  applicantEmail = '';
  applicantPhone = '';

  // Form Fields
  address = '';
  aadhaarNumber = '';
  bankAccount = '';
  additionalNotes = '';
  documentsAcknowledged = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private policyService: PolicyService,
    private applicationService: ApplicationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (user) {
      this.applicantName = `${user.firstName} ${user.lastName}`;
      this.applicantEmail = user.email;
      this.applicantPhone = user.phone || '';
      if (user.organization) {
        this.address = user.organization;
      }
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.policyId = id;
        this.loadPolicyDetails(id);
      } else {
        this.error = 'Policy ID missing.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadPolicyDetails(id: string): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.policyService.getById(id).subscribe({
      next: (res) => {
        this.policy = res.policy;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load policy details.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(d?: string): string { return formatDate(d); }

  onSubmit(): void {
    if (!this.policy) return;
    this.error = '';

    if (!this.address.trim() || !this.aadhaarNumber.trim()) {
      this.error = 'Please enter your Address and Aadhaar Number.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.documentsAcknowledged) {
      this.error = 'Please confirm that all required documents are ready for upload/verification.';
      this.cdr.detectChanges();
      return;
    }

    this.submitting = true;
    this.cdr.detectChanges();

    const payload = {
      applicationType: 'policy' as const,
      policyId: this.policyId,
      formData: {
        address: this.address.trim(),
        aadhaarNumber: this.aadhaarNumber.trim(),
        bankAccount: this.bankAccount.trim(),
        additionalNotes: this.additionalNotes.trim(),
        documentsAcknowledged: this.documentsAcknowledged,
      }
    };

    this.applicationService.submit(payload).subscribe({
      next: () => {
        this.submitted = true;
        this.submitting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to submit application. Please try again.';
        this.submitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToApplications(): void {
    this.router.navigate(['/citizen/applications']);
  }
}
