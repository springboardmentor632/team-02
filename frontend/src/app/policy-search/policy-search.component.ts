import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SearchService } from '../services/search.service';
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

  totalResults = 0;
  results: SearchResult[] = [];
  loading = false;
  error = '';
  notifications: { _id: string }[] = [];

  ministries = ['Ministry of Health & Family Welfare', 'Ministry of Agriculture & Farmers Welfare', 'Ministry of Education', 'Ministry of Housing & Urban Affairs', 'Ministry of Electronics & IT'];
  states = ['All India', 'Delhi', 'Rajasthan', 'Maharashtra', 'Uttar Pradesh'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private searchService: SearchService,
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
      next: (res) => { this.notifications = res.notifications.filter(n => !n.read); },
      error: () => { this.notifications = []; }
    });
  }

  onSearch(): void {
    this.loading = true;
    this.error = '';
    const statusList: string[] = [];
    if (this.statusActive) statusList.push('Active');
    if (this.statusArchived) statusList.push('Archived');
    if (this.statusDraft) statusList.push('Draft');

    this.searchService.search({
      query: this.searchQuery || undefined,
      category: this.activeCategory !== 'All Categories' ? this.activeCategory : undefined,
      ministry: this.ministryFilter || undefined,
      state: this.stateFilter && this.stateFilter !== 'All States' ? this.stateFilter : undefined,
      status: statusList.length === 1 ? statusList[0] : undefined,
    }).subscribe({
      next: (res) => {
        const policyResults: SearchResult[] = res.policies.map((p) => ({
          id: p._id,
          type: 'policy' as const,
          name: p.title,
          icon: getCategoryIcon(p.category),
          ministry: `${p.ministry || 'Government of India'} · Launched ${getLaunchYear(p.publishedAt)}`,
          launchYear: getLaunchYear(p.publishedAt),
          desc: p.summary || p.content?.substring(0, 200) || '',
          tags: p.tags || [p.category],
          scope: p.state === 'All India' ? 'Central' : (p.state || 'Central'),
          status: p.status,
          category: p.category,
        }));
        const schemeResults: SearchResult[] = res.schemes.map((s) => ({
          id: s._id,
          type: 'scheme' as const,
          name: s.name,
          icon: getCategoryIcon(s.category),
          ministry: `${s.ministry || 'Government of India'} · Launched ${getLaunchYear(s.launchDate)}`,
          launchYear: getLaunchYear(s.launchDate),
          desc: s.summary || s.details?.substring(0, 200) || '',
          tags: s.tags || [s.category],
          scope: s.state === 'All India' ? 'Central' : (s.state || 'Central'),
          status: s.status,
          category: s.category,
        }));
        this.results = [...policyResults, ...schemeResults];
        this.totalResults = this.results.length;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load search results. Please try again.';
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
    this.ministryFilter = '';
    this.stateFilter = '';
    this.statusActive = true;
    this.statusArchived = false;
    this.statusDraft = false;
    this.onSearch();
  }

  getDetailLink(r: SearchResult): string[] {
    return r.type === 'policy' ? ['/citizen/policy', r.id] : ['/citizen/scheme', r.id];
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}
