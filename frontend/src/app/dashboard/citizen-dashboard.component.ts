import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SchemeService } from '../services/scheme.service';
import { PolicyService } from '../services/policy.service';
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

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './citizen-dashboard.component.html',
  styleUrl: './citizen-dashboard.component.css'
})
export class CitizenDashboardComponent implements OnInit {
  userName = '';
  userLocation = '';
  userInitials = '';

  stats = [
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
    private policyService: PolicyService,
    private notificationService: NotificationService,
    private searchService: SearchService,
    private statsService: StatsService
  ) {}

  ngOnInit(): void {
    this.userName = this.auth.getUserDisplayName();
    this.userLocation = this.auth.getUserSubtitle();
    this.userInitials = this.auth.getUserInitials();

    // Use public stats endpoint for policy & scheme counts
    this.statsService.getPlatformStats().subscribe({
      next: (res) => {
        this.stats[0].value = res.stats.schemes.toString();
        this.stats[1].value = res.stats.policies.toString();
      },
      error: (err) => console.error('Stats load error:', err)
    });

    // Load recommended schemes (display purposes)
    this.schemeService.getAll({ status: 'Active' }).subscribe({
      next: (res) => {
        this.recommendedSchemes = res.schemes.slice(0, 4).map((s) => ({
          id: s._id,
          name: s.name,
          dept: `${s.category} · ${s.ministry || 'Government of India'}`,
          status: 'Eligible',
          icon: getCategoryIcon(s.category),
        }));
      },
      error: (err) => console.error('Schemes load error:', err)
    });

    // Load notifications
    this.notificationService.getAll().subscribe({
      next: (res) => {
        const unread = res.notifications.filter((n) => !n.read);
        this.notifications = res.notifications.slice(0, 4).map((n) => ({
          title: n.title,
          desc: n.message,
          type: n.type,
        }));
        this.stats[2].value = unread.length.toString();
        this.stats[2].highlight = unread.length > 0;
      },
      error: (err) => {
        console.error('Notifications load error:', err);
        this.stats[2].value = '0';
      }
    });

    // Load search history
    this.searchService.getHistory().subscribe({
      next: (res) => {
        this.recentSearches = res.history.map((h) => h.query).filter(Boolean) as string[];
        this.stats[3].value = res.history.length.toString();
      },
      error: () => {
        this.recentSearches = [];
        this.stats[3].value = '0';
      }
    });
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}
