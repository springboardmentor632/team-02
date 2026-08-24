import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PolicyService } from '../services/policy.service';
import { NotificationService } from '../services/notification.service';
import { getCategoryIcon } from '../utils/helpers';

interface SavedItem {
  id: string;
  type: 'policy' | 'scheme';
  name: string;
  category: string;
  ministry: string;
  status: string;
  savedOn: string;
  icon: string;
}

@Component({
  selector: 'app-saved-policies',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './saved-policies.component.html',
  styleUrl: './saved-policies.component.css'
})
export class SavedPoliciesComponent implements OnInit {
  userName = '';
  userLocation = '';
  userInitials = '';

  savedItems: SavedItem[] = [];
  loading = true;
  error = '';
  notifications: { _id: string }[] = [];

  constructor(
    private router: Router,
    private auth: AuthService,
    private policyService: PolicyService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userName = this.auth.getUserDisplayName();
    this.userLocation = this.auth.getUserSubtitle();
    this.userInitials = this.auth.getUserInitials();
    this.loadSavedPolicies();
    this.notificationService.getAll().subscribe({
      next: (res) => {
        this.notifications = res.notifications.filter(n => !n.read);
        this.cdr.detectChanges();
      },
      error: () => {
        this.notifications = [];
        this.cdr.detectChanges();
      }
    });
  }

  loadSavedPolicies(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.policyService.getSavedPolicies().subscribe({
      next: (res: { saved: any[]; }) => {
        this.savedItems = (res.saved || []).map((item: any) => ({
          id: item._id,
          type: item.type || 'policy',
          name: item.title || item.name,
          category: item.category,
          ministry: item.ministry || 'Government of India',
          status: item.status,
          savedOn: item.savedOn || item.createdAt,
          icon: getCategoryIcon(item.category),
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load saved policies.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  removeSaved(item: SavedItem): void {
    this.policyService.unsavePolicy(item.id).subscribe({
      next: () => {
        this.savedItems = this.savedItems.filter(s => s.id !== item.id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to remove saved policy. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  getDetailLink(item: SavedItem): string[] {
    return item.type === 'policy' ? ['/citizen/policy', item.id] : ['/citizen/scheme', item.id];
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}