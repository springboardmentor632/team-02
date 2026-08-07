import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { PolicyService } from '../services/policy.service';
import { SchemeService } from '../services/scheme.service';
import { SearchService } from '../services/search.service';
import { ApplicationService } from '../services/application.service';
import { StatsService } from '../services/stats.service';
import { NotificationService } from '../services/notification.service';
import { ReportService } from '../services/report.service';
import { formatDate } from '../utils/helpers';

export interface ReportMetric {
  label: string;
  val: string | number;
}

export interface ReportRow {
  id: string;
  name: string;
  category: string;
  generatedOn: string;
  value: string;
  metrics?: ReportMetric[];
  details?: Record<string, any>[];
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  userName = '';
  userRole = '';
  userLocation = '';
  userInitials = '';
  selectedCategory = 'All';
  categories = ['All', 'Policy', 'Scheme', 'Search Activity', 'System Overview'];
  loading = true;

  reports: ReportRow[] = [];
  notifications: { _id: string }[] = [];

  constructor(
    private router: Router,
    private auth: AuthService,
    private policyService: PolicyService,
    private schemeService: SchemeService,
    private searchService: SearchService,
    private applicationService: ApplicationService,
    private statsService: StatsService,
    private reportService: ReportService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userName = this.auth.getUserDisplayName();
    this.userLocation = this.auth.getUserSubtitle();
    this.userInitials = this.auth.getUserInitials();
    const user = this.auth.getCurrentUser();
    this.userRole = user?.role || 'Citizen';
    this.loadReports();

    this.notificationService.getAll().subscribe({
      next: (res) => {
        this.notifications = (res.notifications || []).filter(n => !n.read);
        this.cdr.detectChanges();
      },
      error: () => {
        this.notifications = [];
        this.cdr.detectChanges();
      }
    });
  }

  loadReports(): void {
    this.loading = true;
    this.cdr.detectChanges();
    const today = formatDate(new Date().toISOString());

    forkJoin({
      policies: this.policyService.getAll().pipe(catchError(() => of({ policies: [] }))),
      schemes: this.schemeService.getAll().pipe(catchError(() => of({ schemes: [] }))),
      history: this.searchService.getHistory().pipe(catchError(() => of({ history: [] }))),
      myApps: this.applicationService.getMine().pipe(catchError(() => of({ applications: [] }))),
      allApps: this.applicationService.getAll().pipe(catchError(() => of({ applications: [] }))),
      stats: this.statsService.getPlatformStats().pipe(catchError(() => of({ stats: { policies: 0, schemes: 0, states: 0, users: 0, pendingPolicies: 0, totalPolicies: 0 }, trending: [] }))),
    }).subscribe({
      next: ({ policies, schemes, history, myApps, allApps, stats }) => {
        const polList = policies.policies || [];
        const schList = schemes.schemes || [];
        const histList = history.history || [];
        const myAppList = myApps.applications || [];
        const allAppList = allApps.applications || [];
        const platformStats = stats.stats;

        if (this.userRole === 'Administrator') {
          this.reports = [
            {
              id: '1',
              name: 'Master System Registry & Platform Overview Report',
              category: 'System Overview',
              generatedOn: today,
              value: `${platformStats.totalPolicies || polList.length} Policies, ${schList.length} Schemes, ${platformStats.users || 0} Registered Users`,
              metrics: [
                { label: 'Total Policies', val: platformStats.totalPolicies || polList.length },
                { label: 'Active Schemes', val: schList.length },
                { label: 'Registered Users', val: platformStats.users || 0 },
                { label: 'Total Applications', val: allAppList.length },
              ],
              details: polList.slice(0, 15).map(p => ({ Title: p.title, Category: p.category, Ministry: p.ministry || 'N/A', Status: p.status })),
            },
            {
              id: '2',
              name: 'Policies Publication & Approval Status Report',
              category: 'Policy',
              generatedOn: today,
              value: `${polList.filter(p => p.status === 'Active').length} Active, ${polList.filter(p => p.status === 'Draft').length} Drafts`,
              metrics: [
                { label: 'Published Active', val: polList.filter(p => p.status === 'Active').length },
                { label: 'Pending / Draft', val: polList.filter(p => p.status !== 'Active').length },
              ],
              details: polList.map(p => ({ Title: p.title, Category: p.category, Status: p.status, State: p.state || 'All India' })),
            },
            {
              id: '3',
              name: 'Schemes Implementation & Category Allocation Report',
              category: 'Scheme',
              generatedOn: today,
              value: `${schList.length} active schemes tracked in system`,
              metrics: [
                { label: 'Active Schemes', val: schList.filter(s => s.status === 'Active').length },
                { label: 'Total Submitted Applications', val: allAppList.length },
              ],
              details: schList.map(s => ({ SchemeName: s.name, Category: s.category, Ministry: s.ministry || 'N/A', Status: s.status })),
            },
            {
              id: '4',
              name: 'User Search Activity & Platform Usage Report',
              category: 'Search Activity',
              generatedOn: today,
              value: `${histList.length} search queries recorded in system`,
              metrics: [
                { label: 'Total Searches', val: histList.length },
              ],
              details: histList.map((h: any) => ({ SearchQuery: h.query, PerformedAt: formatDate(h.createdAt || h.searchedAt || h.timestamp) })),
            },
          ];
        } else if (this.userRole === 'Government Official') {
          this.reports = [
            {
              id: '1',
              name: 'Department Policies & Active Status Report',
              category: 'Policy',
              generatedOn: today,
              value: `${polList.length} policies monitored`,
              metrics: [
                { label: 'Department Policies', val: polList.length },
              ],
              details: polList.map(p => ({ Title: p.title, Ministry: p.ministry || 'Department', Status: p.status })),
            },
            {
              id: '2',
              name: 'Government Schemes & Applicants Overview Report',
              category: 'Scheme',
              generatedOn: today,
              value: `${allAppList.length} total applicant submissions across ${schList.length} schemes`,
              metrics: [
                { label: 'Active Schemes', val: schList.filter(s => s.status === 'Active').length },
                { label: 'Total Applications Received', val: allAppList.length },
              ],
              details: allAppList.length ? allAppList.map(a => ({ Applicant: a.applicantName, Scheme: (a.scheme as any)?.name || 'Scheme', Status: a.status, AppliedOn: formatDate(a.createdAt) }))
                : schList.map(s => ({ SchemeName: s.name, Category: s.category, Mode: s.applicationMode || 'Online' })),
            },
            {
              id: '3',
              name: 'Citizen Engagement & Search Inquiry Report',
              category: 'Search Activity',
              generatedOn: today,
              value: `${histList.length} citizen queries logged`,
              metrics: [
                { label: 'Search Queries Logged', val: histList.length },
              ],
              details: histList.slice(0, 15).map((h: any) => ({ Query: h.query, Date: formatDate(h.createdAt || h.searchedAt || h.timestamp) })),
            },
          ];
        } else {
          // Citizen Role
          this.reports = [
            {
              id: '1',
              name: 'My Submitted Scheme Applications Report',
              category: 'Scheme',
              generatedOn: today,
              value: `${myAppList.length} applications submitted in your profile`,
              metrics: [
                { label: 'My Applications', val: myAppList.length },
                { label: 'Approved Applications', val: myAppList.filter(a => a.status === 'Approved').length },
                { label: 'Under Review', val: myAppList.filter(a => a.status === 'Under Review' || a.status === 'Submitted').length },
              ],
              details: myAppList.length ? myAppList.map(a => ({
                SchemeName: (a.scheme as any)?.name || 'Scheme',
                Status: a.status,
                SubmittedOn: formatDate(a.createdAt),
                Applicant: a.applicantName,
              })) : schList.map(s => ({ SchemeName: s.name, Category: s.category, Benefits: s.benefits?.[0] || s.summary || 'Financial Assistance' })),
            },
            {
              id: '2',
              name: 'Available Government Policies & Benefits Report',
              category: 'Policy',
              generatedOn: today,
              value: `${polList.length} government policies active`,
              metrics: [
                { label: 'Available Policies', val: polList.length },
              ],
              details: polList.slice(0, 10).map(p => ({ PolicyTitle: p.title, Category: p.category, Ministry: p.ministry || 'All India' })),
            },
            {
              id: '3',
              name: 'Active Government Welfare Schemes Report',
              category: 'Scheme',
              generatedOn: today,
              value: `${schList.length} schemes open for citizen applications`,
              metrics: [
                { label: 'Active Schemes', val: schList.length },
              ],
              details: schList.map(s => ({ SchemeName: s.name, Category: s.category, Benefits: s.benefits?.[0] || s.summary || 'Financial Assistance' })),
            },
            {
              id: '4',
              name: 'My Search Activity & Inquiry History Report',
              category: 'Search Activity',
              generatedOn: today,
              value: `${histList.length} search activities in profile`,
              metrics: [
                { label: 'Searches Recorded', val: histList.length },
              ],
              details: histList.map((h: any) => ({ Query: h.query, Date: formatDate(h.createdAt || h.searchedAt || h.timestamp) })),
            },
          ];
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredReports(): ReportRow[] {
    return this.selectedCategory === 'All'
      ? this.reports
      : this.reports.filter(r => r.category === this.selectedCategory);
  }

  setCategory(cat: string): void {
    this.selectedCategory = cat;
    this.cdr.detectChanges();
  }

  openPdfInNewTab(report: ReportRow): void {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${report.name} - PolicyGPT Report</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #2A3C2A; background: #fff; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2E5430; padding-bottom: 16px; margin-bottom: 24px; }
          .logo-title { font-size: 24px; font-weight: bold; color: #2E5430; margin: 0; }
          .subtitle { font-size: 13px; color: #5A7A5A; margin-top: 4px; }
          .print-btn { background: #2E5430; color: white; border: none; padding: 10px 20px; font-size: 13px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-bottom: 20px; }
          .meta-box { background: #F2F5EF; border-left: 4px solid #5A7F52; padding: 14px 18px; margin-bottom: 24px; border-radius: 6px; font-size: 13px; }
          .meta-box p { margin: 4px 0; }
          .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
          .metric-card { background: #F6FAF4; border: 1.5px solid #C8D5C0; padding: 16px; border-radius: 8px; text-align: center; }
          .metric-val { font-size: 24px; font-weight: bold; color: #2E5430; }
          .metric-label { font-size: 11px; color: #5A7A5A; text-transform: uppercase; margin-top: 4px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
          th { background: #2E5430; color: #ffffff; padding: 10px 12px; text-align: left; font-weight: 600; }
          td { border-bottom: 1px solid #E0E7DB; padding: 10px 12px; }
          tr:nth-child(even) { background: #F9FBF8; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #ddd; padding-top: 16px; }
          @media print { .print-btn { display: none; } }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
        <div class="header">
          <div>
            <h1 class="logo-title">PolicyGPT — National Policy Portal</h1>
            <div class="subtitle">Official Document Report</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #5A7A5A;">
            <strong>Confidential & Official</strong><br/>
            Ref: RPT-${Math.floor(100000 + Math.random() * 900000)}
          </div>
        </div>
        <div class="meta-box">
          <p><strong>Report Title:</strong> ${report.name}</p>
          <p><strong>User Role:</strong> ${this.userRole}</p>
          <p><strong>Generated By:</strong> ${this.userName}</p>
          <p><strong>Generated Date:</strong> ${report.generatedOn}</p>
          <p><strong>Summary:</strong> ${report.value}</p>
        </div>
        ${report.metrics && report.metrics.length ? `
          <div class="metrics-grid">
            ${report.metrics.map(m => `
              <div class="metric-card">
                <div class="metric-val">${m.val}</div>
                <div class="metric-label">${m.label}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${report.details && report.details.length ? `
          <h3>Data Records Breakdown</h3>
          <table>
            <thead>
              <tr>
                ${Object.keys(report.details[0]).map(k => `<th>${k.toUpperCase()}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${report.details.map(row => `
                <tr>
                  ${Object.values(row).map(val => `<td>${val}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
        <div class="footer">
          PolicyGPT Portal © ${new Date().getFullYear()} — Generated for ${this.userName} (${this.userRole})
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.focus();
    }
  }

  downloadExcel(report: ReportRow): void {
    let csvContent = `Report Name,${report.name}\nGenerated By,${this.userName}\nRole,${this.userRole}\nDate,${report.generatedOn}\nSummary,${report.value}\n\n`;

    if (report.details && report.details.length) {
      const headers = Object.keys(report.details[0]);
      csvContent += headers.join(',') + '\n';
      report.details.forEach(row => {
        const values = headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`);
        csvContent += values.join(',') + '\n';
      });
    } else {
      csvContent += `Report Name,Category,Summary,Date\n"${report.name}","${report.category}","${report.value}","${report.generatedOn}"\n`;
    }

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name.replace(/\s+/g, '_')}_Report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  downloadDocument(report: ReportRow): void {
    const docContent = `
      <html xmlns:o='urn:schemas-microsoft-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${report.name}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #333; margin: 30px; }
          h1 { color: #2E5430; font-size: 20pt; }
          h2 { color: #5A7F52; font-size: 14pt; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background-color: #2E5430; color: #ffffff; padding: 8px; font-size: 10pt; text-align: left; }
          td { border: 1px solid #ddd; padding: 8px; font-size: 9pt; }
        </style>
      </head>
      <body>
        <h1>PolicyGPT — Official Report</h1>
        <h2>${report.name}</h2>
        <p><strong>Category:</strong> ${report.category}</p>
        <p><strong>Generated On:</strong> ${report.generatedOn}</p>
        <p><strong>Generated By:</strong> ${this.userName} (${this.userRole})</p>
        <p><strong>Summary:</strong> ${report.value}</p>
        ${report.details && report.details.length ? `
          <h3>Data Records</h3>
          <table>
            <thead>
              <tr>${Object.keys(report.details[0]).map(k => `<th>${k.toUpperCase()}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${report.details.map(row => `
                <tr>${Object.values(row).map(val => `<td>${val}</td>`).join('')}</tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
      </body>
      </html>
    `;

    const blob = new Blob([docContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name.replace(/\s+/g, '_')}_Report.doc`;
    a.click();
    URL.revokeObjectURL(url);
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}