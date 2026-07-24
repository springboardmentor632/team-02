import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Router, RouterLink } from '@angular/router';

interface PolicyRow { id: number; name: string; category: string; ministry: string; status: 'Pending' | 'Approved' | 'Draft'; }

@Component({
  selector: 'app-policy-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './policy-management.component.html',
  styleUrl: './policy-management.component.css'
})
export class PolicyManagementComponent {
  constructor(private router: Router) {}
  showForm = false;

  newPolicy = { name: '', category: 'Education', ministry: '', description: '' };
  categories = ['Education', 'Healthcare', 'Agriculture', 'Employment', 'Finance', 'Women & Child Welfare', 'Housing', 'Environment', 'Digital Governance', 'Infrastructure'];

  policies: PolicyRow[] = [
    { id: 1, name: 'Digital India 3.0', category: 'Digital Governance', ministry: 'MeitY', status: 'Pending' },
    { id: 2, name: 'Solar Rooftop Scheme', category: 'Environment', ministry: 'MNRE', status: 'Approved' },
    { id: 3, name: 'EV Adoption Policy', category: 'Infrastructure', ministry: 'NITI Aayog', status: 'Approved' },
    { id: 4, name: 'Skill India 2.0', category: 'Employment', ministry: 'MSDE', status: 'Draft' }
  ];

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  addPolicy(): void {
    if (!this.newPolicy.name || !this.newPolicy.ministry) return;
    this.policies.unshift({
      id: this.policies.length + 1,
      name: this.newPolicy.name,
      category: this.newPolicy.category,
      ministry: this.newPolicy.ministry,
      status: 'Draft'
    });
    this.newPolicy = { name: '', category: 'Education', ministry: '', description: '' };
    this.showForm = false;
  }

  approve(p: PolicyRow): void {
    p.status = 'Approved';
  }

  archive(p: PolicyRow): void {
    this.policies = this.policies.filter(x => x.id !== p.id);
  }
   onLogout(): void {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      this.router.navigate(['/login']);
    }
  }
}
