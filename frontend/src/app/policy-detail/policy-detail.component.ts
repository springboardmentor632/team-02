import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-policy-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './policy-detail.component.html',
  styleUrl: './policy-detail.component.css'
})
export class PolicyDetailComponent {
  constructor(private router: Router) {}
  activeTab: 'overview' | 'eligibility' | 'apply' | 'documents' | 'faq' = 'overview';

  policy = {
    name: 'Ayushman Bharat PM-JAY',
    ministry: 'Ministry of Health & Family Welfare · Government of India',
    status: 'Active',
    scope: 'Central Scheme',
    stats: [
      { value: '₹5L', label: 'Annual Cover' },
      { value: '10 Cr+', label: 'Families Covered' },
      { value: '23,000+', label: 'Empanelled Hospitals' },
      { value: '2018', label: 'Launch Year' }
    ],
    about: `Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY) is the world's largest health insurance scheme, fully financed by the government, aimed at reducing catastrophic expenditure on medical treatment. The scheme provides a cover of up to ₹5 lakh per family per year for secondary and tertiary care hospitalisation at empanelled hospitals.`,
    benefits: [
      'Cashless & paperless hospitalisation',
      'Pre- and post-hospitalisation expenses covered',
      '1,929 treatment packages',
      'Available across all states & UTs'
    ],
    details: {
      policyId: 'MoH/2018/PMJAY',
      category: 'Healthcare',
      launchDate: '23 Sep 2018',
      lastUpdated: 'Jan 2026',
      implementing: 'NHA'
    }
  };

  setTab(tab: typeof this.activeTab): void {
    this.activeTab = tab;
  }
  onLogout(): void {
  const confirmLogout = confirm('Are you sure you want to logout?');
  if (confirmLogout) {
    this.router.navigate(['/login']);
  }
}
}