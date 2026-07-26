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
import { SavedPoliciesComponent } from './saved-policy/saved-policies.component';
import { authGuard, adminGuard } from './guards/auth.guard';
export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'dashboard', redirectTo: 'citizen-dashboard', pathMatch: 'full' },
  { path: 'citizen-dashboard', component: CitizenDashboardComponent, canActivate: [authGuard] },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [authGuard] },
  { path: 'government-dashboard', component: GovernmentDashboardComponent, canActivate: [authGuard] },
  { path: 'policy-search', component: PolicySearchComponent, canActivate: [authGuard] },
  { path: 'policy-detail/:id', component: PolicyDetailComponent, canActivate: [authGuard] },
  { path: 'scheme-detail/:id', component: SchemeDetailComponent, canActivate: [authGuard] },
  { path: 'comparison', component: ComparisonComponent, canActivate: [authGuard] },
  { path: 'eligibility', component: EligibilityComponent, canActivate: [authGuard] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [authGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'feedback', component: FeedbackComponent, canActivate: [authGuard] },
  { path: 'admin/policies', component: PolicyManagementComponent, canActivate: [adminGuard] },
  { path: 'admin/schemes', component: SchemeManagementComponent, canActivate: [adminGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: 'saved-policies', component: SavedPoliciesComponent, canActivate: [authGuard] },
];