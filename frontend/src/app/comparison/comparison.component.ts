import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SchemeService } from '../services/scheme.service';
import { NotificationService } from '../services/notification.service';
import { Scheme, EligibilityRule } from '../models/policy.model';
import { getCategoryIcon, getLaunchYear } from '../utils/helpers';

export interface SchemeComparisonDetail {
  id: string;
  name: string;
  category: string;
  icon: string;
  ministry: string;
  launchYear: string;
  benefit: string;
  target: string;
  incomeLimit: string;
  applicationMode: string;
  status: string;
  summary: string;
  documents: string[];
}

@Component({
  selector: 'app-comparison',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './comparison.component.html',
  styleUrl: './comparison.component.css'
})
export class ComparisonComponent implements OnInit {
  allSchemes: Scheme[] = [];
  categories: string[] = ['All Categories'];
  activeCategory = 'All Categories';
  searchQuery = '';

  scheme1Id = '';
  scheme2Id = '';

  scheme1Detail: SchemeComparisonDetail | null = null;
  scheme2Detail: SchemeComparisonDetail | null = null;

  loading = true;
  comparing = false;
  error = '';
  warningMessage = '';

  constructor(
    private auth: AuthService,
    private schemeService: SchemeService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllSchemes();
  }

  loadAllSchemes(): void {
    this.loading = true;
    this.error = '';
    this.schemeService.getAll({ status: 'Active' }).subscribe({
      next: (res) => {
        this.allSchemes = res.schemes || [];
        
        // Extract unique categories
        const catSet = new Set(this.allSchemes.map(s => s.category).filter(Boolean));
        this.categories = ['All Categories', ...Array.from(catSet)];

        // Select default 2 distinct schemes if available
        if (this.allSchemes.length >= 2) {
          this.scheme1Id = this.allSchemes[0]._id;
          this.scheme2Id = this.allSchemes[1]._id;
          this.runComparison();
        } else if (this.allSchemes.length === 1) {
          this.scheme1Id = this.allSchemes[0]._id;
          this.loading = false;
        } else {
          this.loading = false;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('[Comparison] Error loading schemes:', err);
        this.error = 'Failed to load government schemes.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onScheme1Change(newId: string): void {
    if (newId === this.scheme2Id) {
      this.warningMessage = 'Same scheme comparison is not allowed. Automatically adjusted Scheme 2.';
      const alternative = this.allSchemes.find(s => s._id !== newId);
      if (alternative) {
        this.scheme2Id = alternative._id;
      }
    } else {
      this.warningMessage = '';
    }
    this.scheme1Id = newId;
    this.runComparison();
  }

  onScheme2Change(newId: string): void {
    if (newId === this.scheme1Id) {
      this.warningMessage = 'Same scheme comparison is not allowed. Automatically adjusted Scheme 1.';
      const alternative = this.allSchemes.find(s => s._id !== newId);
      if (alternative) {
        this.scheme1Id = alternative._id;
      }
    } else {
      this.warningMessage = '';
    }
    this.scheme2Id = newId;
    this.runComparison();
  }

  swapSchemes(): void {
    if (!this.scheme1Id || !this.scheme2Id || this.scheme1Id === this.scheme2Id) return;
    const temp = this.scheme1Id;
    this.scheme1Id = this.scheme2Id;
    this.scheme2Id = temp;
    this.warningMessage = '';
    this.runComparison();
  }

  selectForComparison(schemeId: string, slot: 1 | 2): void {
    if (slot === 1) {
      if (schemeId === this.scheme2Id) {
        this.scheme2Id = this.scheme1Id;
      }
      this.scheme1Id = schemeId;
    } else {
      if (schemeId === this.scheme1Id) {
        this.scheme1Id = this.scheme2Id;
      }
      this.scheme2Id = schemeId;
    }
    this.warningMessage = '';
    this.runComparison();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  runComparison(): void {
    if (!this.scheme1Id || !this.scheme2Id || this.scheme1Id === this.scheme2Id) {
      this.comparing = false;
      return;
    }

    this.comparing = true;
    this.error = '';

    this.schemeService.compare([this.scheme1Id, this.scheme2Id]).subscribe({
      next: (res) => {
        const rulesMap: Record<string, EligibilityRule> = res.rules || {};
        const mapScheme = (s: Scheme): SchemeComparisonDetail => {
          const rule = rulesMap[s._id];
          return {
            id: s._id,
            name: s.name,
            category: s.category || 'General',
            icon: getCategoryIcon(s.category),
            ministry: s.ministry || 'Government of India',
            launchYear: getLaunchYear(s.launchDate),
            benefit: s.benefits?.[0] || s.summary || 'N/A',
            target: s.eligibilityCriteria?.[0] || 'All Citizens',
            incomeLimit: rule?.incomeLimit || 'Any Household Income',
            applicationMode: s.applicationMode || 'Online Portal',
            status: s.status || 'Active',
            summary: s.summary || '',
            documents: (s.documentsRequired && s.documentsRequired.length > 0) ? s.documentsRequired : ['Aadhaar Card', 'Income Certificate', 'Bank Passbook']
          };
        };

        const s1 = (res.schemes || []).find(s => s._id === this.scheme1Id);
        const s2 = (res.schemes || []).find(s => s._id === this.scheme2Id);

        this.scheme1Detail = s1 ? mapScheme(s1) : null;
        this.scheme2Detail = s2 ? mapScheme(s2) : null;

        this.comparing = false;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('[Comparison] Compare error:', err);
        this.error = 'Failed to load comparison data.';
        this.comparing = false;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get filteredSchemes(): Scheme[] {
    return this.allSchemes.filter((s) => {
      const matchCat = this.activeCategory === 'All Categories' || s.category === this.activeCategory;
      const q = this.searchQuery.toLowerCase().trim();
      const matchQ = !q || s.name.toLowerCase().includes(q) || (s.summary && s.summary.toLowerCase().includes(q)) || (s.ministry && s.ministry.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }

  setCategory(cat: string): void {
    this.activeCategory = cat;
  }

  getIcon(category?: string): string {
    return getCategoryIcon(category || '');
  }
}