import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FeedbackService, FeedbackEntry, FAQ, FeedbackStats } from '../services/feedback.service';
import { NotificationService } from '../services/notification.service';

export type SubModuleType =
  | 'Citizen Feedback'
  | 'Issue Reporting'
  | 'Help Desk'
  | 'FAQ Management'
  | 'Query Resolution'
  | 'Contact Support';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css'
})
export class FeedbackComponent implements OnInit {
  // ── Navigation & Tabs ───────────────────────────────────────────────────────
  activeTab: SubModuleType = 'Citizen Feedback';
  tabs: { id: SubModuleType; label: string; icon: string; badge?: string }[] = [
    { id: 'Citizen Feedback', label: 'Citizen Feedback', icon: '💬' },
    { id: 'Issue Reporting', label: 'Issue Reporting', icon: '🐛' },
    { id: 'Help Desk', label: 'Help Desk', icon: '🎧' },
    { id: 'FAQ Management', label: 'FAQ Management', icon: '📚' },
    { id: 'Query Resolution', label: 'Query Resolution', icon: '❓' },
    { id: 'Contact Support', label: 'Contact Support', icon: '📞' }
  ];

  // ── User Information & Auth ─────────────────────────────────────────────────
  userName = '';
  userLocation = '';
  userInitials = '';
  userRole = '';
  isOfficer = false;
  notificationsCount = 0;

  // ── Realistic Dynamic Statistics ───────────────────────────────────────────
  selectedStatsRole = 'All';
  rolesList = ['All', 'Citizen', 'Government Official', 'Administrator', 'Researcher', 'Organization'];
  stats: FeedbackStats = {
    totalCount: 0,
    byModule: {
      'Citizen Feedback': 0,
      'Issue Reporting': 0,
      'Help Desk': 0,
      'FAQ Management': 0,
      'Query Resolution': 0,
      'Contact Support': 0
    },
    byStatus: { 'New': 0, 'In Progress': 0, 'Resolved': 0, 'Closed': 0 },
    byPriority: { 'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0 },
    byRole: { 'Citizen': 0, 'Government Official': 0, 'Administrator': 0, 'Researcher': 0, 'Organization': 0 },
    averageRating: 0,
    resolutionRate: 0,
    avgResponseTimeHours: 0,
    slaCompliancePercent: 0
  };

  // ── Feedback Items State ──────────────────────────────────────────────────
  feedbacks: FeedbackEntry[] = [];
  loadingFeedbacks = false;
  activeFeedback: FeedbackEntry | null = null;

  // Form Fields for Submitting Tickets
  formSubject = '';
  formMessage = '';
  formCategory = 'General Feedback';
  formPriority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
  formRating = 5;
  formDepartment = 'General Support';
  submitting = false;
  submitted = false;
  formError = '';

  // Options
  categoriesMap: Record<SubModuleType, string[]> = {
    'Citizen Feedback': ['General Feedback', 'Policy Rating', 'Usability Suggestion', 'Content Feedback'],
    'Issue Reporting': ['System Bug', 'Eligibility Calculation Issue', 'Page Load Failure', 'Document Upload Error'],
    'Help Desk': ['Application Assistance', 'Account Access', 'Payment/Subsidy Query', 'Verification Help'],
    'FAQ Management': ['Healthcare', 'Education', 'Agriculture', 'Technical Support', 'General'],
    'Query Resolution': ['Policy Question', 'Scheme Rules', 'Document Requirement', 'Deadline Clarification'],
    'Contact Support': ['Contact Helpline', 'Direct Callback', 'Department Routing', 'Emergency Escalation']
  };

  priorities = ['Low', 'Medium', 'High', 'Critical'];
  departments = ['General Support', 'Ministry of Health', 'Department of Agriculture', 'Ministry of Education', 'IT Support Desk'];
  statuses = ['New', 'In Progress', 'Resolved', 'Closed'];

  // Filters for Officer View
  filterStatus = 'All';
  filterPriority = 'All';
  filterRole = 'All';
  filterDepartment = 'All';
  searchQuery = '';

  // Officer Response & Thread State
  replyStatus = 'New';
  replyPriority = 'Medium';
  replyDepartment = 'General Support';
  replyText = '';
  threadMessage = '';

  // ── FAQ Management State (Sub-module iv) ────────────────────────────────────
  faqs: FAQ[] = [];
  faqSearch = '';
  faqCategory = 'All';
  showFaqModal = false;
  showAskModal = false;
  editingFaqId: string | null = null;
  faqForm = {
    question: '',
    answer: '',
    category: 'General',
    targetRole: 'All',
    isPublished: true
  };
  askForm = {
    question: '',
    category: 'General'
  };
  faqChatInputs: Record<string, string> = {};
  submittingFaqChat: Record<string, boolean> = {};

  // ── Convert Query to FAQ Modal State ───────────────────────────────────────
  showConvertModal = false;
  convertQueryItem: FeedbackEntry | null = null;
  convertForm = {
    question: '',
    answer: '',
    category: 'General',
    targetRole: 'All'
  };

  constructor(
    private router: Router,
    private auth: AuthService,
    private feedbackService: FeedbackService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.userName = this.auth.getUserDisplayName();
    this.userLocation = this.auth.getUserSubtitle();
    this.userInitials = this.auth.getUserInitials();
    this.userRole = user?.role || 'Citizen';
    this.isOfficer = ['Government Official', 'Administrator'].includes(this.userRole);

    // Scope stats strictly to user's role for non-officers (e.g., 'Citizen')
    if (!this.isOfficer) {
      this.selectedStatsRole = this.userRole;
      const faqTab = this.tabs.find(t => t.id === 'FAQ Management');
      if (faqTab) faqTab.label = 'Frequently Asked Questions';
    } else {
      this.selectedStatsRole = 'All';
    }

    this.loadStats();
    this.loadFeedbacks();
    this.loadFaqs();

    this.notificationService.getAll().subscribe({
      next: (res) => {
        this.notificationsCount = res.notifications.filter(n => !n.read).length;
      },
      error: () => { this.notificationsCount = 0; }
    });
  }

  // ── Tab Navigation ─────────────────────────────────────────────────────────
  switchTab(tabId: SubModuleType): void {
    this.activeTab = tabId;
    this.activeFeedback = null;
    this.submitted = false;
    this.formError = '';
    this.formCategory = this.categoriesMap[tabId][0] || 'General Feedback';
    this.loadFeedbacks();
    if (tabId === 'FAQ Management') {
      this.loadFaqs();
    }
  }

  // ── Data Loaders ───────────────────────────────────────────────────────────
  loadStats(): void {
    this.feedbackService.getStats(this.selectedStatsRole).subscribe({
      next: (res) => {
        if (res && res.stats) {
          this.stats = res.stats;
        }
      },
      error: () => {
        this.stats = {
          totalCount: 0,
          byModule: { 'Citizen Feedback': 0, 'Issue Reporting': 0, 'Help Desk': 0, 'FAQ Management': 0, 'Query Resolution': 0, 'Contact Support': 0 },
          byStatus: { 'New': 0, 'In Progress': 0, 'Resolved': 0, 'Closed': 0 },
          byPriority: { 'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0 },
          byRole: { 'Citizen': 0, 'Government Official': 0, 'Administrator': 0, 'Researcher': 0, 'Organization': 0 },
          averageRating: 0,
          resolutionRate: 0,
          avgResponseTimeHours: 0,
          slaCompliancePercent: 0
        };
      }
    });
  }

  onStatsRoleChange(): void {
    this.loadStats();
  }

  loadFeedbacks(): void {
    this.loadingFeedbacks = true;
    const params: any = {
      moduleType: this.activeTab
    };

    if (this.isOfficer) {
      if (this.filterStatus !== 'All') params.status = this.filterStatus;
      if (this.filterPriority !== 'All') params.priority = this.filterPriority;
      if (this.filterRole !== 'All') params.role = this.filterRole;
      if (this.filterDepartment !== 'All') params.department = this.filterDepartment;
      if (this.searchQuery) params.search = this.searchQuery;
    } else {
      if (this.searchQuery) params.search = this.searchQuery;
    }

    this.feedbackService.getAll(params).subscribe({
      next: (res) => {
        this.feedbacks = res.feedback || [];
        this.loadingFeedbacks = false;
      },
      error: () => {
        this.feedbacks = [];
        this.loadingFeedbacks = false;
      }
    });
  }

  loadFaqs(): void {
    const params: any = {};
    if (this.faqCategory !== 'All') params.category = this.faqCategory;
    if (this.faqSearch) params.search = this.faqSearch;

    if (this.isOfficer) {
      this.feedbackService.getAdminFaqs().subscribe({
        next: (res) => { this.faqs = res.faqs || []; },
        error: () => { this.faqs = []; }
      });
    } else {
      this.feedbackService.getFaqs(params).subscribe({
        next: (res) => { this.faqs = res.faqs || []; },
        error: () => { this.faqs = []; }
      });
    }
  }

  // ── Ticket Submissions ──────────────────────────────────────────────────────
  onSubmitTicket(form: NgForm): void {
    if (form.invalid) return;
    this.submitting = true;
    this.formError = '';

    const user = this.auth.getCurrentUser();
    const payload: Partial<FeedbackEntry> = {
      moduleType: this.activeTab,
      name: user ? `${user.firstName} ${user.lastName}` : 'Anonymous User',
      email: user?.email || '',
      subject: this.formSubject,
      message: this.formMessage,
      category: this.formCategory,
      priority: this.formPriority,
      rating: this.formRating,
      department: this.formDepartment
    };

    this.feedbackService.submit(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.submitted = true;
        form.resetForm({
          formCategory: this.categoriesMap[this.activeTab][0],
          formPriority: 'Medium',
          formRating: 5,
          formDepartment: 'General Support'
        });
        this.formSubject = '';
        this.formMessage = '';
        this.loadFeedbacks();
        this.loadStats();
      },
      error: (err) => {
        this.submitting = false;
        this.formError = err.error?.message || 'Failed to submit ticket. Please try again.';
      }
    });
  }

  // ── Selection & Detail View ─────────────────────────────────────────────────
  selectFeedback(fb: FeedbackEntry): void {
    this.activeFeedback = fb;
    this.replyStatus = fb.status || 'New';
    this.replyPriority = fb.priority || 'Medium';
    this.replyDepartment = fb.department || 'General Support';
    this.replyText = fb.response || '';
    this.threadMessage = '';
  }

  // ── Officer Updates & Thread Replies ─────────────────────────────────────────
  submitOfficerUpdate(): void {
    if (!this.activeFeedback || !this.activeFeedback._id) return;

    this.feedbackService.update(this.activeFeedback._id, {
      status: this.replyStatus,
      priority: this.replyPriority,
      department: this.replyDepartment,
      response: this.replyText
    }).subscribe({
      next: (res) => {
        this.activeFeedback = res.feedback;
        this.loadFeedbacks();
        this.loadStats();
        alert('Ticket updated successfully!');
      },
      error: () => alert('Failed to update ticket.')
    });
  }

  sendThreadMessage(): void {
    if (!this.activeFeedback || !this.activeFeedback._id || !this.threadMessage.trim()) return;

    this.feedbackService.addMessage(this.activeFeedback._id, this.threadMessage, this.isOfficer ? this.replyText : undefined).subscribe({
      next: (res) => {
        this.activeFeedback = res.feedback;
        this.threadMessage = '';
        this.loadFeedbacks();
        this.loadStats();
      },
      error: () => alert('Failed to send message.')
    });
  }

  deleteTicket(fbId?: string): void {
    if (!fbId) return;
    if (confirm('Are you sure you want to delete this ticket entry?')) {
      this.feedbackService.delete(fbId).subscribe({
        next: () => {
          this.activeFeedback = null;
          this.loadFeedbacks();
          this.loadStats();
        },
        error: () => alert('Failed to delete item.')
      });
    }
  }

  // ── FAQ Operations & Public Chat Thread ─────────────────────────────────────
  voteFaq(faq: FAQ, type: 'helpful' | 'unhelpful'): void {
    if (!faq._id) return;
    this.feedbackService.voteFaq(faq._id, type).subscribe({
      next: (res) => {
        if (res.faq) {
          faq.helpfulCount = res.faq.helpfulCount;
          faq.unhelpfulCount = res.faq.unhelpfulCount;
        }
      }
    });
  }

  sendFaqMessage(faq: FAQ): void {
    const faqId = faq._id;
    if (!faqId) return;
    const text = (this.faqChatInputs[faqId] || '').trim();
    if (!text) return;

    this.submittingFaqChat[faqId] = true;
    this.feedbackService.addFaqMessage(faqId, text).subscribe({
      next: (res) => {
        this.faqChatInputs[faqId] = '';
        this.submittingFaqChat[faqId] = false;
        if (res && res.faq) {
          faq.messages = res.faq.messages;
          faq.answer = res.faq.answer;
        } else {
          this.loadFaqs();
        }
      },
      error: (err) => {
        this.submittingFaqChat[faqId] = false;
        const msg = err.error?.message || 'Failed to send message in FAQ thread.';
        alert(msg);
      }
    });
  }

  openAskModal(): void {
    this.askForm = { question: '', category: 'General' };
    this.showAskModal = true;
  }

  closeAskModal(): void {
    this.showAskModal = false;
  }

  submitAskQuestion(): void {
    if (!this.askForm.question.trim()) return;
    this.feedbackService.createFaq({
      question: this.askForm.question.trim(),
      category: this.askForm.category,
      isPublished: true
    }).subscribe({
      next: () => {
        this.closeAskModal();
        this.loadFaqs();
        alert('Your question has been posted to the public FAQ portal! Administrators and Officers can now view and reply.');
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to submit question.';
        alert(msg);
      }
    });
  }

  openFaqModal(faq?: FAQ): void {
    if (faq) {
      this.editingFaqId = faq._id || null;
      this.faqForm = {
        question: faq.question,
        answer: faq.answer,
        category: faq.category || 'General',
        targetRole: faq.targetRole || 'All',
        isPublished: faq.isPublished !== false
      };
    } else {
      this.editingFaqId = null;
      this.faqForm = {
        question: '',
        answer: '',
        category: 'General',
        targetRole: 'All',
        isPublished: true
      };
    }
    this.showFaqModal = true;
  }

  closeFaqModal(): void {
    this.showFaqModal = false;
    this.editingFaqId = null;
  }

  saveFaq(): void {
    if (!this.faqForm.question) return;

    if (this.editingFaqId) {
      this.feedbackService.updateFaq(this.editingFaqId, this.faqForm).subscribe({
        next: () => {
          this.closeFaqModal();
          this.loadFaqs();
        },
        error: () => alert('Failed to update FAQ.')
      });
    } else {
      this.feedbackService.createFaq(this.faqForm).subscribe({
        next: () => {
          this.closeFaqModal();
          this.loadFaqs();
        },
        error: () => alert('Failed to create FAQ.')
      });
    }
  }

  deleteFaq(faqId?: string): void {
    if (!faqId) return;
    if (confirm('Are you sure you want to delete this FAQ item?')) {
      this.feedbackService.deleteFaq(faqId).subscribe({
        next: () => this.loadFaqs(),
        error: () => alert('Failed to delete FAQ.')
      });
    }
  }

  // ── Convert Query to FAQ (Sub-module v action for Officers) ─────────────────
  openConvertModal(fb: FeedbackEntry): void {
    this.convertQueryItem = fb;
    this.convertForm = {
      question: fb.subject,
      answer: fb.response || fb.message,
      category: fb.category || 'General',
      targetRole: 'All'
    };
    this.showConvertModal = true;
  }

  closeConvertModal(): void {
    this.showConvertModal = false;
    this.convertQueryItem = null;
  }

  submitConvertQuery(): void {
    if (!this.convertForm.question || !this.convertForm.answer) return;

    this.feedbackService.convertQueryToFaq({
      queryId: this.convertQueryItem?._id,
      ...this.convertForm
    }).subscribe({
      next: () => {
        alert('Query successfully converted to public FAQ!');
        this.closeConvertModal();
        this.loadFeedbacks();
        this.loadFaqs();
        this.loadStats();
      },
      error: () => alert('Failed to convert query to FAQ.')
    });
  }

  // Helper getters for rating stars
  getStars(rating: number = 5): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStars(rating: number = 5): number[] {
    return Array(Math.max(0, 5 - rating)).fill(0);
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}