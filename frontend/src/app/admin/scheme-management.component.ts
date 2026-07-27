import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SchemeService } from '../services/scheme.service';
import { Scheme } from '../models/policy.model';

@Component({
  selector: 'app-scheme-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scheme-management.component.html',
  styleUrl: './scheme-management.component.css'
})
export class SchemeManagementComponent implements OnInit {
  showForm = false;
  loading = true;
  error = '';

  newScheme = { name: '', category: 'Scholarships', summary: '', benefit: '', ministry: '', applicationMode: 'Online' };
  categories = ['Scholarships', 'Farmer Welfare', 'Healthcare', 'Housing', 'Business Support', 'Women Empowerment', 'Senior Citizen Welfare', 'Student Schemes', 'Employment Programs', 'Social Security'];

  schemes: Scheme[] = [];

  constructor(
    private router: Router,
    private auth: AuthService,
    private schemeService: SchemeService
  ) {}

  ngOnInit(): void {
    this.loadSchemes();
  }

  loadSchemes(): void {
    this.loading = true;
    this.schemeService.getAll().subscribe({
      next: (res) => {
        this.schemes = res.schemes;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load schemes.';
        this.loading = false;
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  addScheme(): void {
    if (!this.newScheme.name || !this.newScheme.benefit) return;
    this.schemeService.create({
      name: this.newScheme.name,
      category: this.newScheme.category,
      summary: this.newScheme.summary,
      benefits: [this.newScheme.benefit],
      ministry: this.newScheme.ministry,
      applicationMode: this.newScheme.applicationMode,
      status: 'Active',
      launchDate: new Date().toISOString(),
    }).subscribe({
      next: () => {
        this.newScheme = { name: '', category: 'Scholarships', summary: '', benefit: '', ministry: '', applicationMode: 'Online' };
        this.showForm = false;
        this.loadSchemes();
      },
      error: () => { this.error = 'Failed to create scheme.'; }
    });
  }

  activate(s: Scheme): void {
    this.schemeService.update(s._id, { status: 'Active', launchDate: new Date().toISOString() }).subscribe({
      next: () => this.loadSchemes(),
    });
  }

  archive(s: Scheme): void {
    this.schemeService.update(s._id, { status: 'Archived' }).subscribe({
      next: () => this.loadSchemes(),
    });
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}
