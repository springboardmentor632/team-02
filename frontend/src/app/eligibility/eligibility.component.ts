import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { EligibilityService } from '../services/eligibility.service';
import { SchemeService } from '../services/scheme.service';
import { NotificationService } from '../services/notification.service';
import { getCategoryIcon, parseIncome, mapDisability } from '../utils/helpers';

interface MatchedScheme {
  id: string;
  name: string;
  category: string;
  benefit: string;
  icon: string;
}

@Component({
  selector: 'app-eligibility',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './eligibility.component.html',
  styleUrl: './eligibility.component.css'
})
export class EligibilityComponent {
  userName = '';
  userLocation = '';
  currentStep = 1;
  totalSteps = 4;
  steps = ['Personal Info', 'Financial Info', 'Location', 'Results'];

  age: number | null = null;
  gender = '';
  education = '';
  maritalStatus = '';

  income = '₹1,00,000 - ₹2,50,000';
  occupation = 'Farmer';
  socialCategory = 'OBC';
  disability = 'No Disability';
  landHolding = 'Below 1 Acre';
  housingType = 'Pucca House';
  interestedCategories: string[] = [];
  allCategories = ['Agriculture', 'Healthcare', 'Housing', 'Education', 'Employment', 'Finance', 'Women Welfare', 'Senior Citizens'];

  state = '';
  district = '';
  areaType = '';

  loading = false;
  error = '';
  previewSchemes: string[] = [];
  previewCount = 0;
  matchedSchemes: MatchedScheme[] = [];
  notifications: { _id: string }[] = [];

  constructor(
    private router: Router,
    private auth: AuthService,
    private eligibilityService: EligibilityService,
    private schemeService: SchemeService,
    private notificationService: NotificationService
  ) {
    this.userName = this.auth.getUserDisplayName();
    this.userLocation = this.auth.getUserSubtitle();
    this.schemeService.getAll({ status: 'Active' }).subscribe({
      next: (res) => {
        this.previewSchemes = res.schemes.map((s) => s.name);
        this.previewCount = res.schemes.length;
      }
    });
    this.notificationService.getAll().subscribe({
      next: (res) => { this.notifications = res.notifications.filter(n => !n.read); },
      error: () => { this.notifications = []; }
    });
  }

  toggleCategory(cat: string): void {
    const idx = this.interestedCategories.indexOf(cat);
    if (idx >= 0) {
      this.interestedCategories.splice(idx, 1);
    } else {
      this.interestedCategories.push(cat);
    }
  }

  isSelected(cat: string): boolean {
    return this.interestedCategories.includes(cat);
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
    if (this.currentStep === this.totalSteps) {
      this.runEligibilityCheck();
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step < this.currentStep) {
      this.currentStep = step;
    }
  }

  private runEligibilityCheck(): void {
    this.loading = true;
    this.error = '';
    const location = this.areaType === 'Rural' ? 'Rural' : (this.state || 'Any');

    this.eligibilityService.check({
      age: this.age || 25,
      gender: this.gender || 'Any',
      income: parseIncome(this.income),
      occupation: this.occupation,
      education: this.education || 'Any',
      location,
      socialCategory: this.socialCategory,
      disabilityStatus: mapDisability(this.disability),
    }).subscribe({
      next: (res) => {
        this.matchedSchemes = res.matches.map((m) => ({
          id: m.scheme._id,
          name: m.scheme.name,
          category: m.scheme.category,
          benefit: m.scheme.benefits?.[0] || m.scheme.summary || '',
          icon: getCategoryIcon(m.scheme.category),
        }));
        this.loading = false;
      },
      error: () => {
        this.error = 'Eligibility check failed. Please try again.';
        this.loading = false;
      }
    });
  }

  restart(): void {
    this.currentStep = 1;
    this.matchedSchemes = [];
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}
