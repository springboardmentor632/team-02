import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
    private schemeService: SchemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSchemes();
  }

  loadSchemes(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.schemeService.getAll().subscribe({
      next: (res) => {
        this.schemes = res.schemes || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load schemes.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.cdr.detectChanges();
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
      error: () => {
        this.error = 'Failed to create scheme.';
        this.cdr.detectChanges();
      }
    });
  }

  approve(s: Scheme): void {
    this.schemeService.approveScheme(s._id).subscribe({
      next: () => this.loadSchemes(),
      error: () => {
        this.error = 'Failed to approve scheme.';
        this.cdr.detectChanges();
      }
    });
  }

  reject(s: Scheme): void {
    this.schemeService.rejectScheme(s._id).subscribe({
      next: () => this.loadSchemes(),
      error: () => {
        this.error = 'Failed to reject scheme.';
        this.cdr.detectChanges();
      }
    });
  }

  deleteScheme(s: Scheme): void {
    if (!confirm(`Are you sure you want to delete scheme "${s.name}"?`)) return;
    this.schemeService.delete(s._id).subscribe({
      next: () => this.loadSchemes(),
      error: () => {
        this.error = 'Failed to delete scheme.';
        this.cdr.detectChanges();
      }
    });
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}
