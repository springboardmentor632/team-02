import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface SchemeRow { id: number; name: string; category: string; benefit: string; status: 'Active' | 'Draft' | 'Archived'; }

@Component({
  selector: 'app-scheme-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './scheme-management.component.html',
  styleUrl: './scheme-management.component.css'
})
export class SchemeManagementComponent {
  showForm = false;
  newScheme = { name: '', category: 'Scholarships', benefit: '' };
  categories = ['Scholarships', 'Farmer Welfare', 'Healthcare', 'Housing', 'Business Support', 'Women Empowerment', 'Senior Citizen Welfare', 'Student Schemes', 'Employment Programs', 'Social Security'];

  schemes: SchemeRow[] = [
    { id: 1, name: 'PM Kisan Samman Nidhi', category: 'Farmer Welfare', benefit: '₹6,000/year', status: 'Active' },
    { id: 2, name: 'National Scholarship Portal', category: 'Scholarships', benefit: 'Up to ₹12,000/year', status: 'Active' },
    { id: 3, name: 'Stand Up India', category: 'Business Support', benefit: '₹10L - ₹1Cr loan', status: 'Draft' }
  ];

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  addScheme(): void {
    if (!this.newScheme.name || !this.newScheme.benefit) return;
    this.schemes.unshift({
      id: this.schemes.length + 1,
      name: this.newScheme.name,
      category: this.newScheme.category,
      benefit: this.newScheme.benefit,
      status: 'Draft'
    });
    this.newScheme = { name: '', category: 'Scholarships', benefit: '' };
    this.showForm = false;
  }

  activate(s: SchemeRow): void {
    s.status = 'Active';
  }

  archive(s: SchemeRow): void {
    s.status = 'Archived';
  }
}