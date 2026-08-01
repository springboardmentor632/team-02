import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { StatsService } from '../services/stats.service';
import { formatStatNumber } from '../utils/helpers';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  searchQuery = '';

  stats = [
    { value: '—', label: 'Active Policies' },
    { value: '—', label: 'Welfare Schemes' },
    { value: '—', label: 'States & UTs' },
    { value: '—', label: 'Registered Users' },
  ];

  trending: string[] = [];

  features = [
    { title: 'Smart Policy Search', desc: 'Find relevant policies by keyword, ministry, state, or sector in seconds.', icon: 'search', iconColor: '#e31b23', bgColor: '#fff5f5' },
    { title: 'Policy Alerts & Deadlines', desc: 'Get notified about new schemes, policy updates, and application deadlines.', icon: 'notifications', iconColor: '#2b6cb0', bgColor: '#ebf8ff' },
    { title: 'Eligibility Checker', desc: 'Answer a few questions and instantly discover schemes you qualify for.', icon: 'assignment_turned_in', iconColor: '#2f855a', bgColor: '#f0fff4' },
    { title: 'Analytics Dashboard', desc: 'Track policy engagement, scheme uptake, and citizen interaction data.', icon: 'bar_chart', iconColor: '#805ad5', bgColor: '#faf5ff' },
    { title: 'Scheme Comparison', desc: 'Compare multiple policies and schemes side-by-side to find the best fit.', icon: 'compare_arrows', iconColor: '#dd6b20', bgColor: '#fffaf0' },
    { title: 'Reports & Exports', desc: 'Download policy reports in PDF or Excel format for offline reference.', icon: 'cloud_download', iconColor: '#319795', bgColor: '#e6fffa' },
  ];

  stakeholders = [
    { label: 'Citizens', desc: 'Find & apply for benefits', icon: 'person', iconColor: '#1A365D' },
    { label: 'Govt Officials', desc: 'Publish & manage policies', icon: 'business', iconColor: '#2F855A' },
    { label: 'Researchers', desc: 'Analyse policy data', icon: 'school', iconColor: '#C05621' },
    { label: 'Organisations', desc: 'Track relevant regulations', icon: 'corporate_fare', iconColor: '#2B6CB0' },
    { label: 'NGOs', desc: 'Support welfare outreach', icon: 'favorite', iconColor: '#E53E3E' },
  ];

  constructor(
    private statsService: StatsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.statsService.getPlatformStats().subscribe({
      next: (res) => {
        if (!res?.stats) return;
        const s = res.stats;
        this.stats = [
          { value: formatStatNumber(s.policies), label: 'Active Policies' },
          { value: formatStatNumber(s.schemes), label: 'Welfare Schemes' },
          { value: `${s.states}`, label: 'States & UTs' },
          { value: formatStatNumber(s.users), label: 'Registered Users' },
        ];
        this.trending = res.trending ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load platform stats:', err);
        this.trending = ['PM Kisan', 'Ayushman Bharat', 'Digital India'];
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      window.location.href = `/login?returnUrl=citizen/search&q=${encodeURIComponent(this.searchQuery)}`;
    }
  }
}
