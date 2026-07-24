import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterLink } from '@angular/router';

interface ReportRow {
  id: number;
  name: string;
  category: string;
  generatedOn: string;
  format: 'PDF' | 'Excel';
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
  constructor(private router: Router) {}
  selectedCategory = 'All';
  categories = ['All', 'Policy', 'Scheme', 'User Activity', 'Department'];
  generating = false;

  reports: ReportRow[] = [
    { id: 1, name: 'Monthly Policy Summary', category: 'Policy', generatedOn: '10 Jul 2026', format: 'PDF' },
    { id: 2, name: 'Scheme Enrollment Report', category: 'Scheme', generatedOn: '08 Jul 2026', format: 'Excel' },
    { id: 3, name: 'User Engagement Report', category: 'User Activity', generatedOn: '05 Jul 2026', format: 'PDF' },
    { id: 4, name: 'Department-wise Applications', category: 'Department', generatedOn: '01 Jul 2026', format: 'Excel' }
  ];

  get filteredReports(): ReportRow[] {
    return this.selectedCategory === 'All' ? this.reports : this.reports.filter(r => r.category === this.selectedCategory);
  }

  setCategory(cat: string): void {
    this.selectedCategory = cat;
  }

  generateNewReport(): void {
    this.generating = true;
    setTimeout(() => {
      this.generating = false;
      this.reports.unshift({
        id: this.reports.length + 1,
        name: 'Newly Generated Report',
        category: 'Policy',
        generatedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        format: 'PDF'
      });
    }, 1000);
  }

  downloadReport(report: ReportRow): void {
    console.log('Downloading:', report.name);
  }
  onLogout(): void {
  const confirmLogout = confirm('Are you sure you want to logout?');
  if (confirmLogout) {
    this.router.navigate(['/login']);
  }
}
}