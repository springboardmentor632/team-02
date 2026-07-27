import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SchemeService } from '../services/scheme.service';
import { NotificationService } from '../services/notification.service';
import { SearchService } from '../services/search.service';
import { StatsService } from '../services/stats.service';
import { getCategoryIcon } from '../utils/helpers';

interface SchemeItem {
  id: string;
  name: string;
  dept: string;
  status: string;
  icon: string;
}

interface NotifItem {
  title: string;
  desc: string;
  type: 'warning' | 'success' | 'info' | 'danger';
}

interface StatCard {
  label: string;
  value: string;
  sub: string;
  icon: string;
  highlight?: boolean;
}

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './citizen-dashboard.component.html',
  styleUrl: './citizen-dashboard.component.css'
})
export class CitizenDashboardComponent implements OnInit {
  greeting = '';
  userName = '';
  userLocation = '';
  userInitials = '';

  eligibleSchemes = '—';
  activePolicies = '—';
  notificationCount = '—';
  searchCount = '—';
  notificationHighlight = false;

  stats: StatCard[] = [
    { label: 'Eligible Schemes', value: '—', sub: 'Active schemes available', icon: '🎖️' },
    { label: 'Active Policies', value: '—', sub: 'Published policies', icon: '🔖' },
    { label: 'Notifications', value: '—', sub: 'Unread alerts', icon: '🔔', highlight: false },
    { label: 'Searches Made', value: '—', sub: 'Your recent activity', icon: '🔍' }
  ];

  recommendedSchemes: SchemeItem[] = [];
  notifications: NotifItem[] = [];
  recentSearches: string[] = [];

  constructor(
    private router: Router,
    private auth: AuthService,
    private schemeService: SchemeService,
    private notificationService: NotificationService,
    private searchService: SearchService,
    private statsService: StatsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.greeting = this.getGreeting();
    this.userName = this.auth.getUserDisplayName();
    this.userLocation = this.auth.getUserSubtitle();
    this.userInitials = this.auth.getUserInitials();

    // ---- STATS: uses public endpoint, no auth needed ----
    this.statsService.getPlatformStats().subscribe({
      next: (res) => {
        // Replace the entire array to guarantee change detection fires
        this.stats = [
          { label: 'Eligible Schemes', value: String(res.stats.schemes), sub: 'Active schemes available', icon: '🎖️' },
          { label: 'Active Policies', value: String(res.stats.policies), sub: 'Published policies', icon: '🔖' },
          { label: 'Notifications', value: '—', sub: 'Unread alerts', icon: '🔔', highlight: false },
          { label: 'Searches Made', value: '—', sub: 'Your recent activity', icon: '🔍' }
        ];
        this.cdr.markForCheck();
      },
      error: (err) => console.error('[CitizenDashboard] Stats error:', err)
    });

    // ---- SCHEMES: load recommended schemes list ----
    this.schemeService.getAll({ status: 'Active' }).subscribe({
      next: (res) => {
        this.recommendedSchemes = res.schemes.slice(0, 4).map((s) => ({
          id: s._id,
          name: s.name,
          dept: `${s.category} · ${s.ministry || 'Government of India'}`,
          status: 'Eligible',
          icon: getCategoryIcon(s.category),
        }));
        this.cdr.markForCheck();
      },
      error: (err) => console.error('[CitizenDashboard] Schemes error:', err)
    });

    // ---- NOTIFICATIONS ----
    this.notificationService.getAll().subscribe({
      next: (res) => {
        const unread = res.notifications.filter((n) => !n.read);
        this.notifications = res.notifications.slice(0, 4).map((n) => ({
          title: n.title,
          desc: n.message,
          type: n.type,
        }));
        // Update notification count in stats array
        this.stats = this.stats.map((s, i) =>
          i === 2
            ? { ...s, value: String(unread.length), highlight: unread.length > 0 }
            : s
        );
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('[CitizenDashboard] Notifications error:', err);
        this.stats = this.stats.map((s, i) => i === 2 ? { ...s, value: '0' } : s);
        this.cdr.markForCheck();
      }
    });

    // ---- SEARCH HISTORY ----
    this.searchService.getHistory().subscribe({
      next: (res) => {
        this.recentSearches = (res.history || []).map((h) => h.query).filter(Boolean) as string[];
        this.stats = this.stats.map((s, i) =>
          i === 3 ? { ...s, value: String(res.history.length) } : s
        );
        this.cdr.markForCheck();
      },
      error: () => {
        this.recentSearches = [];
        this.stats = this.stats.map((s, i) => i === 3 ? { ...s, value: '0' } : s);
        this.cdr.markForCheck();
      }
    });
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
    private getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';

  }
}
