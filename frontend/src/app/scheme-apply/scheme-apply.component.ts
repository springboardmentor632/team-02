import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SchemeService } from '../services/scheme.service';
import { EligibilityService } from '../services/eligibility.service';
import { ApplicationService } from '../services/application.service';
import { Scheme, EligibilityProfile } from '../models/policy.model';
import { getCategoryIcon, parseIncome, mapDisability } from '../utils/helpers';

const ELIGIBILITY_STORAGE_KEY = 'citizenEligibilityProfile';

@Component({
  selector: 'app-scheme-apply',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './scheme-apply.component.html',
  styleUrl: './scheme-apply.component.css',
})
export class SchemeApplyComponent implements OnInit {
  schemeId = '';
  scheme: Scheme | null = null;
  loading = true;
  submitting = false;
  submitted = false;
  error = '';
  eligibilityError = '';
  isEligible = false;
  checkingEligibility = false;

  currentStep = 1;
  steps = ['Scheme Info', 'Eligibility', 'Application', 'Review'];

  // Personal / eligibility fields
  age: number | null = null;
  gender = '';
  education = '';
  income = '₹1,00,000 - ₹2,50,000';
  occupation = 'Farmer';
  socialCategory = 'OBC';
  disability = 'No Disability';
  state = '';
  district = '';
  areaType = '';

  // Application form
  address = '';
  aadhaarNumber = '';
  bankAccount = '';
  additionalNotes = '';
  documentsAcknowledged = false;
  requiredDocuments: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private schemeService: SchemeService,
    private eligibilityService: EligibilityService,
    private applicationService: ApplicationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.prefillFromProfile();
    this.loadSavedEligibility();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.schemeId = id;
        this.loadSchemeDetails(id);
      } else {
        this.error = 'Scheme not found.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadSchemeDetails(id: string): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.schemeService.getById(id).subscribe({
      next: (res) => {
        this.scheme = res.scheme;
        this.requiredDocuments = [
          'Aadhaar Card',
          'Address Proof',
          'Income Certificate',
          ...(this.scheme.eligibilityCriteria?.slice(0, 2) || []),
        ];
        this.loading = false;
        this.cdr.detectChanges();
        this.verifyEligibility();
      },
      error: () => {
        this.error = 'Failed to load scheme details.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private prefillFromProfile(): void {
    const user = this.auth.getCurrentUser();
    if (user?.phone) {
      this.address = user.organization ? `${user.organization}` : '';
    }
  }

  private loadSavedEligibility(): void {
    const saved = sessionStorage.getItem(ELIGIBILITY_STORAGE_KEY);
    if (!saved) return;
    try {
      const profile = JSON.parse(saved);
      this.age = profile.age ?? this.age;
      this.gender = profile.gender || this.gender;
      this.education = profile.education || this.education;
      this.income = profile.incomeLabel || this.income;
      this.occupation = profile.occupation || this.occupation;
      this.socialCategory = profile.socialCategory || this.socialCategory;
      this.disability = profile.disability || this.disability;
      this.state = profile.state || this.state;
      this.district = profile.district || this.district;
      this.areaType = profile.areaType || this.areaType;
    } catch {
      sessionStorage.removeItem(ELIGIBILITY_STORAGE_KEY);
    }
  }

  get schemeIcon(): string {
    return this.scheme ? getCategoryIcon(this.scheme.category) : '📋';
  }

  get eligibilityProfile(): EligibilityProfile {
    const location = this.areaType === 'Rural' ? 'Rural' : (this.state || 'Any');
    return {
      age: this.age || 25,
      gender: this.gender || 'Any',
      income: parseIncome(this.income),
      occupation: this.occupation,
      education: this.education || 'Any',
      location,
      socialCategory: this.socialCategory,
      disabilityStatus: mapDisability(this.disability),
      state: this.state,
      district: this.district,
      areaType: this.areaType,
    };
  }

  verifyEligibility(): void {
    if (!this.schemeId) return;
    this.checkingEligibility = true;
    this.eligibilityError = '';

    this.eligibilityService.check(this.eligibilityProfile).subscribe({
      next: (res) => {
        this.isEligible = res.matches.some((m) => m.scheme._id === this.schemeId);
        if (!this.isEligible) {
          this.eligibilityError = 'Your current profile does not meet the eligibility criteria for this scheme.';
        }
        this.checkingEligibility = false;
      },
      error: () => {
        this.eligibilityError = 'Could not verify eligibility. Please try again.';
        this.checkingEligibility = false;
      },
    });
  }

  nextStep(): void {
    if (this.currentStep === 2 && !this.isEligible) {
      this.eligibilityError = 'Please update your details to meet eligibility requirements before continuing.';
      return;
    }
    if (this.currentStep === 3) {
      if (!this.address.trim() || !this.aadhaarNumber.trim() || !this.documentsAcknowledged) {
        this.error = 'Please fill all required fields and confirm document availability.';
        return;
      }
      this.error = '';
    }
    if (this.currentStep < 4) {
      this.currentStep++;
    }
    if (this.currentStep === 2 && !this.checkingEligibility && !this.isEligible) {
      this.verifyEligibility();
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.error = '';
    }
  }

  onSubmit(): void {
    if (!this.scheme || !this.isEligible) return;
    this.submitting = true;
    this.error = '';

    this.applicationService.submit({
      schemeId: this.schemeId,
      eligibilitySnapshot: this.eligibilityProfile,
      formData: {
        address: this.address.trim(),
        aadhaarNumber: this.aadhaarNumber.trim(),
        bankAccount: this.bankAccount.trim(),
        additionalNotes: this.additionalNotes.trim(),
        documentsAcknowledged: this.documentsAcknowledged,
      },
    }).subscribe({
      next: () => {
        this.submitted = true;
        this.submitting = false;
        sessionStorage.removeItem(ELIGIBILITY_STORAGE_KEY);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to submit application. Please try again.';
        this.submitting = false;
      },
    });
  }

  goToApplications(): void {
    this.router.navigate(['/citizen/applications']);
  }
}
