import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router,RouterLink } from '@angular/router';

interface PolicyResult {
  id: string;
  icon: string;
  name: string;
  ministry: string;
  launchYear: string;
  desc: string;
  tags: string[];
  scope: 'Central' | 'State';
  status: 'Active' | 'Archived' | 'Draft';
}

@Component({
  selector: 'app-policy-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './policy-search.component.html',
  styleUrl: './policy-search.component.css'
})
export class PolicySearchComponent {
  constructor(private router: Router) {}
  userName = 'Rahul Sharma';
  userLocation = 'Citizen · Delhi';
  searchQuery = 'healthcare scheme';
  activeCategory = 'All Categories';
  categories = ['All Categories', 'Healthcare', 'Agriculture', 'Education', 'Housing', 'Employment', 'Finance'];

  ministryFilter = 'All Ministries';
  stateFilter = 'All States';
  typeFilter = 'All Types';
  statusActive = true;
  statusArchived = false;
  statusDraft = true;

  totalResults = 248;
  

  results: PolicyResult[] = [
    {
      id: 'ayushman-bharat',
      icon: '❤️',
      name: 'Ayushman Bharat PM-JAY',
      ministry: 'Ministry of Health & Family Welfare · Launched 2018',
      desc: 'Provides health cover of ₹5 lakh per family per year for secondary and tertiary hospitalisation to over 10 crore poor and vulnerable families.',
      tags: ['Healthcare', 'Insurance', 'BPL Families', 'RSBY Cover'],
      scope: 'Central',
      status: 'Active',
      launchYear: '2018'
    },
    {
      id: 'pmsma',
      icon: '🤱',
      name: 'Pradhan Mantri Surakshit Matritva Abhiyan',
      ministry: 'Ministry of Health & Family Welfare · Launched 2016',
      desc: 'Provides assured, comprehensive and quality antenatal care to pregnant women on the 9th of every month at government health facilities.',
      tags: ['Maternal Health', 'Pregnant Women', 'Free Checkup'],
      scope: 'State',
      status: 'Active',
      launchYear: '2016'
    },
    {
      id: 'jan-aushadhi',
      icon: '💊',
      name: 'Jan Aushadhi Pariyojana',
      ministry: 'Pharma & Medical Devices Bureau · Launched 2008',
      desc: 'Aims to make quality medicines available at affordable prices, especially for poor patients through Pradhan Mantri Bhartiya Janaushadhi Kendras.',
      tags: ['Generic Medicines', 'Affordable', 'All Citizens'],
      scope: 'Central',
      status: 'Active',
      launchYear: '2008'
    }
  ];

  onSearch(): void {
    // TODO: real backend call — GET /policies/search?q=...
    console.log('Searching for:', this.searchQuery);
  }

  setCategory(cat: string): void {
    this.activeCategory = cat;
  }

  applyFilters(): void {
    // TODO: real backend call with filters
    console.log('Applying filters');
  }

  clearAll(): void {
    this.ministryFilter = 'All Ministries';
    this.stateFilter = 'All States';
    this.typeFilter = 'All Types';
    this.statusActive = true;
    this.statusArchived = false;
    this.statusDraft = true;
  }
  onLogout(): void {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      window.location.href = '/login'; // यह बिना किसी एरर के सीधा लॉगिन पेज पर भेज देगा
    }
  }
notifications: any[] = [];


}