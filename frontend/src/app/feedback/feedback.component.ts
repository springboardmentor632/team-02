import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FeedbackService } from '../services/feedback.service';
import { NotificationService } from '../services/notification.service';

interface FAQ { q: string; a: string; open: boolean; }

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css'
})
export class FeedbackComponent implements OnInit {
  subject = '';
  category = 'General Feedback';
  message = '';
  submitting = false;
  submitted = false;
  error = '';

  categories = ['General Feedback', 'Report an Issue', 'Scheme Query', 'Technical Support', 'Other'];

  faqs: FAQ[] = [
    { q: 'How do I check my scheme eligibility?', a: 'Go to the Eligibility Checker page and fill in your personal, financial, and location details to see matching schemes.', open: false },
    { q: 'How long does it take to hear back on feedback?', a: 'Our support team typically responds within 3-5 working days.', open: false },
    { q: 'Can I track my application status?', a: 'Yes, application status updates appear on your Dashboard under Notifications.', open: false },
    { q: 'Is my data secure on this platform?', a: 'Yes, all data is protected using JWT authentication and role-based access control.', open: false }
  ];

  notifications: { _id: string }[] = [];
  userName = '';
  userLocation = '';
  userInitials = '';
  userRole = '';

  feedbacks: any[] = [];
  activeFeedbackId: string | null = null;
  replyText = '';
  replyStatus = 'New';
  statuses = ['New', 'In Progress', 'Resolved'];

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

    this.loadFeedbacks();

    this.notificationService.getAll().subscribe({
      next: (res) => { this.notifications = res.notifications.filter(n => !n.read); },
      error: () => { this.notifications = []; }
    });
  }

  loadFeedbacks(): void {
    this.feedbackService.getAll().subscribe({
      next: (res) => { this.feedbacks = res.feedback; },
      error: () => { this.feedbacks = []; }
    });
  }

  toggleFaq(faq: FAQ): void {
    faq.open = !faq.open;
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) return;
    this.submitting = true;
    this.error = '';
    const user = this.auth.getCurrentUser();
    this.feedbackService.submit({
      name: user ? `${user.firstName} ${user.lastName}` : 'Anonymous',
      email: user?.email || '',
      subject: `[${this.category}] ${this.subject}`,
      message: this.message,
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.submitted = true;
        form.resetForm();
        this.category = 'General Feedback';
        this.loadFeedbacks();
      },
      error: () => {
        this.submitting = false;
        this.error = 'Failed to submit feedback. Please try again.';
      }
    });
  }

  selectFeedback(fb: any): void {
    this.activeFeedbackId = fb._id;
    this.replyText = fb.response || '';
    this.replyStatus = fb.status || 'New';
  }

  submitReply(): void {
    if (!this.activeFeedbackId) return;
    this.feedbackService.update(this.activeFeedbackId, {
      status: this.replyStatus,
      response: this.replyText
    }).subscribe({
      next: () => {
        alert('Feedback updated successfully!');
        this.activeFeedbackId = null;
        this.replyText = '';
        this.loadFeedbacks();
      },
      error: () => {
        alert('Failed to update feedback.');
      }
    });
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
    }
  }
}