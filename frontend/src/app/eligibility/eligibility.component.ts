import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router,RouterLink } from '@angular/router';

interface Scheme {
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
  constructor(private router: Router) {}
  currentStep = 1;
  totalSteps = 4;
  steps = ['Personal Info', 'Financial Info', 'Location', 'Results'];

  // Step 1 — Personal Info
  age: number | null = null;
  gender = '';
  education = '';
  maritalStatus = '';

  // Step 2 — Financial & Occupational
  income = '₹1,00,000 - ₹2,50,000';
  occupation = 'Farmer';
  socialCategory = 'OBC';
  disability = 'No Disability';
  landHolding = 'Below 1 Acre';
  housingType = 'Pucca House';
  interestedCategories = ['Agriculture', 'Finance'];
  allCategories = ['Agriculture', 'Healthcare', 'Housing', 'Education', 'Employment', 'Finance', 'Women Welfare', 'Senior Citizens'];

  // Step 3 — Location
  state = '';
  district = '';
  areaType = '';

  loading = false;

  previewSchemes = ['PM Kisan Samman Nidhi', 'Ayushman Bharat', 'MGNREGA', 'Kisan Credit Card', 'PMFBY (Crop Insurance)'];
  matchedSchemes: Scheme[] = [];

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
    // TODO: real backend call — POST /eligibility/check
    setTimeout(() => {
      this.loading = false;
      this.matchedSchemes = [
        { name: 'PM Kisan Samman Nidhi', category: 'Agriculture', benefit: '₹6,000/year', icon: '🌾' },
        { name: 'Ayushman Bharat PM-JAY', category: 'Healthcare', benefit: 'Up to ₹5 lakh coverage', icon: '❤️' },
        { name: 'MGNREGA', category: 'Employment', benefit: '100 days guaranteed work', icon: '🛠️' },
        { name: 'Kisan Credit Card', category: 'Finance', benefit: 'Low-interest crop loans', icon: '💳' },
        { name: 'PMFBY (Crop Insurance)', category: 'Agriculture', benefit: 'Crop loss protection', icon: '🌦️' }
      ];
    }, 1000);
  }

  restart(): void {
    this.currentStep = 1;
    this.matchedSchemes = [];
  }
  onLogout(): void {
  const confirmLogout = confirm('Are you sure you want to logout?');
  if (confirmLogout) {
    this.router.navigate(['/login']);
  }
}
}