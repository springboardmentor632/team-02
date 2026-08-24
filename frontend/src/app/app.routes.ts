import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './login/forgot-password.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { CitizenLayoutComponent } from './layouts/citizen-layout/citizen-layout.component';
import { GovernmentLayoutComponent } from './layouts/government-layout/government-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { CitizenDashboardComponent } from './dashboard/citizen-dashboard.component';
import { GovernmentDashboardComponent } from './dashboard/government-dashboard.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { PolicySearchComponent } from './policy-search/policy-search.component';
import { PolicyDetailComponent } from './policy-detail/policy-detail.component';
import { SchemeDetailComponent } from './scheme-detail/scheme-detail.component';
import { ComparisonComponent } from './comparison/comparison.component';
import { EligibilityComponent } from './eligibility/eligibility.component';
import { SchemeApplyComponent } from './scheme-apply/scheme-apply.component';
import { PolicyApplyComponent } from './policy-apply/policy-apply.component';
import { MyApplicationsComponent } from './my-applications/my-applications.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ReportsComponent } from './reports/reports.component';
import { ProfileComponent } from './profile/profile.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { PolicyManagementComponent } from './admin/policy-management.component';
import { SchemeManagementComponent } from './admin/scheme-management.component';
import { SettingsComponent } from './settings/settings.component';
import { SavedPoliciesComponent } from './saved-policy/saved-policies.component';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { CitizenAnalyticsComponent } from './analytics/citizen-analytics.component';
import { DepartmentAnalyticsComponent } from './analytics/department-analytics.component';
import { UsageStatisticsComponent } from './analytics/usage-statistics.component';
import {
  citizenGuard,
  governmentGuard,
  adminGuard,
  dashboardRedirectGuard
} from './guards/auth.guard';

export const routes: Routes = [
  // ── Public routes ─────────────────────────────────────────────────────────
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },

  // ── Smart dashboard redirect (reads role, sends to correct dashboard) ──────
  { path: 'dashboard', canActivate: [dashboardRedirectGuard], component: LandingComponent },

  // ── CITIZEN workspace (/citizen/*) ────────────────────────────────────────
  {
    path: 'citizen',
    component: CitizenLayoutComponent,
    canActivate: [citizenGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',     component: CitizenDashboardComponent },
      { path: 'analytics',     component: CitizenAnalyticsComponent },
      { path: 'search',        component: PolicySearchComponent },
      { path: 'eligibility',   component: EligibilityComponent },
      { path: 'applications',  component: MyApplicationsComponent },
      { path: 'compare',       component: ComparisonComponent },
      { path: 'saved',         component: SavedPoliciesComponent },
      { path: 'reports',       component: ReportsComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'profile',       component: ProfileComponent },
      { path: 'feedback',      component: FeedbackComponent },
      { path: 'settings',      component: SettingsComponent },
      { path: 'policy/:id/apply', component: PolicyApplyComponent },
      { path: 'policy/:id',    component: PolicyDetailComponent },
      { path: 'scheme/:id/apply', component: SchemeApplyComponent },
      { path: 'scheme/:id',    component: SchemeDetailComponent },
    ]
  },

  // ── GOVERNMENT OFFICIAL workspace (/government/*) ─────────────────────────
  {
    path: 'government',
    component: GovernmentLayoutComponent,
    canActivate: [governmentGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',     component: GovernmentDashboardComponent },
      { path: 'analytics',     component: DepartmentAnalyticsComponent },
      { path: 'policies',      component: PolicyManagementComponent },
      { path: 'schemes',       component: SchemeManagementComponent },
      { path: 'reports',       component: ReportsComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'profile',       component: ProfileComponent },
      { path: 'feedback',      component: FeedbackComponent },
    ]
  },

  // ── ADMINISTRATOR workspace (/admin/*) ────────────────────────────────────
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',   component: AdminDashboardComponent },
      { path: 'usage-stats', component: UsageStatisticsComponent },
      { path: 'users',       component: UserManagementComponent },
      { path: 'policies',    component: PolicyManagementComponent },
      { path: 'schemes',     component: SchemeManagementComponent },
      { path: 'reports',     component: ReportsComponent },
      { path: 'feedback',    component: FeedbackComponent },
      { path: 'settings',    component: SettingsComponent },
      { path: 'profile',     component: ProfileComponent },
    ]
  },

  // ── Legacy redirects for backwards compatibility ───────────────────────────
  { path: 'citizen-dashboard',    redirectTo: '/citizen/dashboard',    pathMatch: 'full' },
  { path: 'government-dashboard', redirectTo: '/government/dashboard', pathMatch: 'full' },
  { path: 'admin-dashboard',      redirectTo: '/admin/dashboard',      pathMatch: 'full' },
  { path: 'policy-search',        redirectTo: '/citizen/search',      pathMatch: 'full' },

  // ── 404 fallback ──────────────────────────────────────────────────────────
  { path: '**', redirectTo: '' }
];