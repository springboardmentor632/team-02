import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Scheme {
  name: string;
  dept: string;
  status: 'Eligible' | 'Partial';
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
export class CitizenDashboardComponent {
  userName = 'Rahul Sharma';
  userLocation = 'Citizen · Delhi';

  stats = [
    { label: 'Eligible Schemes', value: '18', sub: '↑ 3 new this month', icon: '🎖️' },
    { label: 'Saved Policies', value: '7', sub: 'Last saved 2 days ago', icon: '🔖' },
    { label: 'Notifications', value: '4', sub: '2 urgent deadlines', icon: '🔔', highlight: true },
    { label: 'Searches Made', value: '24', sub: 'This month', icon: '🔍' }
  ];

  recommendedSchemes: Scheme[] = [
    { name: 'PM Kisan Samman Nidhi', dept: 'Agriculture · Ministry of Agriculture', status: 'Eligible', icon: '🌾' },
    { name: 'Ayushman Bharat PM-JAY', dept: 'Healthcare · Ministry of Health', status: 'Eligible', icon: '❤️' },
    { name: 'PM Awas Yojana — Urban', dept: 'Housing · Ministry of Housing', status: 'Partial', icon: '🏠' },
    { name: 'National Scholarship Portal', dept: 'Education · Ministry of Education', status: 'Eligible', icon: '🎓' }
  ];

  notifications: NotifItem[] = [
    { title: 'PM Kisan Deadline', desc: 'Application closes in 5 days', type: 'warning' },
    { title: 'New Healthcare Scheme', desc: '3 new health policies added', type: 'success' },
    { title: 'Policy Update', desc: 'MGNREGA wage revised upward', type: 'info' },
    { title: 'Scholarship Deadline', desc: 'NSP closing tonight 11:59 PM', type: 'danger' }
  ];

  recentSearches = ['PM Kisan', 'Housing scheme Delhi', 'Education scholarship OBC', 'MGNREGA wage 2025', 'Digital India programme', 'Startup India scheme'];
}