import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  searchQuery = '';

  stats = [
    { value: '12,400+', label: 'Active Policies' },
    { value: '3,800+', label: 'Welfare Schemes' },
    { value: '36 States', label: '& UTs Covered' },
    { value: '5.2M+', label: 'Citizens Served' }
  ];

  trending = ['PM Kisan', 'Ayushman Bharat', 'MGNREGA', 'Startup India', 'Digital India Scheme'];

  features = [
    { icon: '🔍', title: 'Smart Policy Search', desc: 'Find relevant policies by keyword, ministry, state, or sector in seconds' },
    { icon: '✅', title: 'Eligibility Checker', desc: 'Answer a few questions and instantly discover schemes you qualify for' },
    { icon: '⇄', title: 'Scheme Comparison', desc: 'Compare multiple policies and schemes side-by-side to find the best fit' },
    { icon: '🔔', title: 'Policy Alerts', desc: 'Get notified about new schemes, policy updates, and application deadlines' },
    { icon: '📊', title: 'Analytics Dashboard', desc: 'Track policy engagement, scheme uptake, and citizen interaction data' },
    { icon: '📄', title: 'Reports & Exports', desc: 'Download policy reports in PDF or Excel format for offline reference' }
  ];

  stakeholders = [
    { icon: '👤', label: 'Citizens', desc: 'Find and apply for benefits' },
    { icon: '🏛️', label: 'Govt Officials', desc: 'Publish and manage policies' },
    { icon: '🔬', label: 'Researchers', desc: 'Analyze policy data' },
    { icon: '🏢', label: 'Organisations', desc: 'Track relevant regulations' },
    { icon: '❤️', label: 'NGOs', desc: 'Support welfare outreach' }
  ];

  onSearch(): void {
    
    console.log('Searching:', this.searchQuery);
  }
}