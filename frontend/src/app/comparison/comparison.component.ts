import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface SchemeCol {
  name: string;
  icon: string;
  ministry: string;
  launchYear: string;
  benefit: string;
  target: string;
  incomeLimit: string;
  applicationMode: string;
  status: string;
  eligible: boolean;
}

@Component({
  selector: 'app-comparison',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './comparison.component.html',
  styleUrl: './comparison.component.css'
})
export class ComparisonComponent {
  schemes: SchemeCol[] = [
    {
      name: 'Ayushman Bharat',
      icon: '❤️',
      ministry: 'Ministry of Health',
      launchYear: '2018',
      benefit: '₹5 Lakh / year',
      target: 'BPL Families',
      incomeLimit: 'SECC Data Based',
      applicationMode: 'Online / Hospital',
      status: 'Active',
      eligible: true
    },
    {
      name: 'PM Kisan',
      icon: '🌾',
      ministry: 'Ministry of Agriculture',
      launchYear: '2019',
      benefit: '₹6,000 / year',
      target: 'Small Farmers',
      incomeLimit: 'All Farmers',
      applicationMode: 'Online / PM Kisan Portal',
      status: 'Active',
      eligible: true
    },
    {
      name: 'PM Awas Yojana',
      icon: '🏠',
      ministry: 'Ministry of Housing',
      launchYear: '2015',
      benefit: '₹2.67 Lakh subsidy',
      target: 'Urban Poor / EWS',
      incomeLimit: 'Below ₹3L / Year',
      applicationMode: 'Online / CSC',
      status: 'Active',
      eligible: false
    }
  ];

  addScheme(): void {
    // TODO: open a modal/search to add another scheme to compare
    console.log('Add scheme clicked');
  }
}