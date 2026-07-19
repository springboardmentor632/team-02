import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-scheme-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './scheme-detail.component.html',
  styleUrl: './scheme-detail.component.css'
})
export class SchemeDetailComponent {
  activeTab: 'overview' | 'eligibility' | 'benefits' | 'documents' = 'overview';

  scheme = {
    name: 'PM Kisan Samman Nidhi',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    status: 'Active',
    category: 'Farmer Welfare',
    stats: [
      { value: '₹6,000', label: 'Annual Benefit' },
      { value: '11 Cr+', label: 'Farmers Enrolled' },
      { value: '3', label: 'Installments/Year' },
      { value: '2019', label: 'Launch Year' }
    ],
    about: `PM-KISAN is a Central Sector Scheme launched to supplement the financial needs of Small and Marginal Farmers (SMFs) in procuring various inputs to ensure proper crop health and appropriate yields. Under the scheme, an income support of ₹6,000 per year is provided in three equal installments.`,
    eligibility: [
      'All landholding farmer families',
      'Cultivable landholding in their name',
      'Subject to certain exclusion criteria (institutional landholders, income tax payers, etc.)'
    ],
    documents: ['Aadhaar Card', 'Land ownership records', 'Bank account details']
  };

  setTab(tab: typeof this.activeTab): void {
    this.activeTab = tab;
  }
}