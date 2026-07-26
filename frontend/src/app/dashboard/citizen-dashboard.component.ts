import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SchemeService } from '../services/scheme.service';
import { PolicyService } from '../services/policy.service';
import { NotificationService } from '../services/notification.service';
import { SearchService } from '../services/search.service';
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
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.userName = this.auth.getUserDisplayName();
    this.userLocation = this.auth.getUserSubtitle();
    this.userInitials = this.auth.getUserInitials();

    this.schemeService.getAll({ status: 'Active' }).subscribe({
      next: (res) => {
        this.recommendedSchemes = res.schemes.slice(0, 4).map((s) => ({
          id: s._id,
          name: s.name,
          dept: `${s.category} · ${s.ministry || 'Government of India'}`,
          status: 'Eligible',
          icon: getCategoryIcon(s.category),
        }));
        this.stats[0].value = res.schemes.length.toString();
      }
    });

    this.policyService.getAll({ status: 'Active' }).subscribe({
      next: (res) => {
        this.stats[1].value = res.policies.length.toString();
      }
    });

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
      }
    });

    this.searchService.getHistory().subscribe({
      next: (res) => {
        this.recentSearches = res.history.map((h) => h.query).filter(Boolean) as string[];
        this.stats[3].value = res.history.length.toString();
      },
      error: () => { this.recentSearches = []; }
    });
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}
