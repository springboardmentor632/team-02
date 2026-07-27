import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SearchService } from '../services/search.service';
import { PolicyService } from '../services/policy.service';
import { SchemeService } from '../services/scheme.service';
import { NotificationService } from '../services/notification.service';
import { SearchResult } from '../models/policy.model';
import { getCategoryIcon, getLaunchYear } from '../utils/helpers';

@Component({
  selector: 'app-policy-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './policy-search.component.html',
  styleUrl: './policy-search.component.css'
})
export class PolicySearchComponent implements OnInit {
  userName = '';
  userLocation = '';
  userInitials = 'GU';
  searchQuery = '';
  activeCategory = 'All Categories';
  categories = ['All Categories', 'Healthcare', 'Agriculture', 'Education', 'Housing', 'Employment', 'Finance', 'Digital Governance', 'Environment'];

  ministryFilter = '';
  stateFilter = '';
  statusActive = true;
  statusArchived = false;
  statusDraft = false;

  sortBy = 'Most Relevant';
  sortOptions = ['Most Relevant', 'Newest First', 'Oldest First', 'Alphabetical'];

  totalResults = 0;
  results: SearchResult[] = [];
  loading = false;
  error = '';
  notifications: { _id: string }[] = [];

  ministries = [
    'Ministry of Health & Family Welfare',
    'Ministry of Agriculture & Farmers Welfare',
    'Ministry of Education',
    'Ministry of Housing & Urban Affairs',
    'Ministry of Electronics & IT',
    'Ministry of Finance',
    'Ministry of Rural Development',
    'Ministry of Skill Development and Entrepreneurship',
    'Ministry of Women and Child Development',
    'Ministry of Petroleum and Natural Gas',
    'Ministry of New and Renewable Energy',
    'Ministry of Communications',
    'Ministry of Labour and Employment',
  ];
  states = ['All States', 'National', 'Delhi', 'Rajasthan', 'Maharashtra', 'Uttar Pradesh', 'Tamil Nadu', 'Karnataka', 'Gujarat'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private searchService: SearchService,
    private policyService: PolicyService,
    private schemeService: SchemeService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.userName = this.auth.getUserDisplayName();
    this.userLocation = this.auth.getUserSubtitle();
    this.userInitials = this.auth.getUserInitials();

    this.route.queryParams.subscribe((params) => {
      if (params['q']) {
        this.searchQuery = params['q'];
      }
      if (params['category']) {
        this.activeCategory = params['category'];
      }
      this.onSearch();
    });

    this.notificationService.getAll().subscribe({
      next: (res) => { this.notifications = res.notifications.filter(n => !(n as any).read); },
      error: () => { this.notifications = []; }
    });
  }

  onSearch(): void {
    this.loading = true;
    this.error = '';

    const statuses: string[] = [];
    if (this.statusActive) statuses.push('Active');
    if (this.statusArchived) statuses.push('Archived');
    if (this.statusDraft) statuses.push('Draft');
    // Default to Active if none selected
    if (statuses.length === 0) statuses.push('Active');

    this.searchService.search({
      query: this.searchQuery || undefined,
      category: this.activeCategory !== 'All Categories' ? this.activeCategory : undefined,
      ministry: this.ministryFilter || undefined,
      state: this.stateFilter && this.stateFilter !== 'All States' ? this.stateFilter : undefined,
      statuses,
    } as any).subscribe({
      next: (res) => {
        const policyResults: SearchResult[] = res.policies.map((p) => ({
          id: p._id,
          type: 'policy' as const,
          name: p.title,
          icon: getCategoryIcon(p.category),
          ministry: `${p.ministry || 'Government of India'} · ${getLaunchYear(p.publishedAt)}`,
          launchYear: getLaunchYear(p.publishedAt),
          desc: p.summary || (p.content ? p.content.substring(0, 200) : '') || '',
          tags: p.tags || [p.category],
          scope: p.state === 'National' || p.state === 'All India' ? 'National' : (p.state || 'National'),
          status: p.status,
          category: p.category,
        }));
        const schemeResults: SearchResult[] = res.schemes.map((s) => ({
          id: s._id,
          type: 'scheme' as const,
          name: s.name,
          icon: getCategoryIcon(s.category),
          ministry: `${s.ministry || 'Government of India'} · ${getLaunchYear(s.launchDate)}`,
          launchYear: getLaunchYear(s.launchDate),
          desc: s.summary || (s.details ? s.details.substring(0, 200) : '') || '',
          tags: s.tags || [s.category],
          scope: s.state === 'National' || s.state === 'All India' ? 'National' : (s.state || 'National'),
          status: s.status,
          category: s.category,
        }));

        let combined = [...policyResults, ...schemeResults];

        // Apply sort
        if (this.sortBy === 'Newest First') {
          combined.sort((a, b) => (b.launchYear || '').localeCompare(a.launchYear || ''));
        } else if (this.sortBy === 'Oldest First') {
          combined.sort((a, b) => (a.launchYear || '').localeCompare(b.launchYear || ''));
        } else if (this.sortBy === 'Alphabetical') {
          combined.sort((a, b) => a.name.localeCompare(b.name));
        }

        this.results = combined;
        this.totalResults = combined.length;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load results. Please try again.';
        this.loading = false;
      }
    });
  }

  setCategory(cat: string): void {
    this.activeCategory = cat;
    this.onSearch();
  }

  applyFilters(): void {
    this.onSearch();
  }

  clearAll(): void {
    this.searchQuery = '';
    this.ministryFilter = '';
    this.stateFilter = '';
    this.statusActive = true;
    this.statusArchived = false;
    this.statusDraft = false;
    this.activeCategory = 'All Categories';
    this.sortBy = 'Most Relevant';
    this.onSearch();
  }

  getDetailLink(r: SearchResult): string[] {
    const role = this.auth.getUserRole()?.toLowerCase() || 'citizen';
    if (r.type === 'policy') return [`/${role}/policy`, r.id];
    return [`/${role}/scheme`, r.id];
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}
