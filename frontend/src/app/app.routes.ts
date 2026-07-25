import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './login/forgot-password.component';
import { CitizenDashboardComponent } from './dashboard/citizen-dashboard.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { GovernmentDashboardComponent } from './dashboard/government-dashboard.component';
import { PolicySearchComponent } from './policy-search/policy-search.component';
import { PolicyDetailComponent } from './policy-detail/policy-detail.component';
import { SchemeDetailComponent } from './scheme-detail/scheme-detail.component';
import { ComparisonComponent } from './comparison/comparison.component';
import { EligibilityComponent } from './eligibility/eligibility.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ReportsComponent } from './reports/reports.component';
import { ProfileComponent } from './profile/profile.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { PolicyManagementComponent } from './admin/policy-management.component';
import { SchemeManagementComponent } from './admin/scheme-management.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  // { path: 'dashboard', component: CitizenDashboardComponent ,

    
  // },
  { path: 'citizen-dashboard', component: CitizenDashboardComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  
  { path: 'government-dashboard', component: GovernmentDashboardComponent },
  { path: 'policy-search', component: PolicySearchComponent },
  { path: 'policy-detail', component: PolicyDetailComponent },
  { path: 'scheme-detail', component: SchemeDetailComponent },
  { path: 'comparison', component: ComparisonComponent },
  { path: 'eligibility', component: EligibilityComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'feedback', component: FeedbackComponent },
  { path: 'admin/policies', component: PolicyManagementComponent },
  { path: 'admin/schemes', component: SchemeManagementComponent },
  { path: 'settings', component: SettingsComponent },
];



