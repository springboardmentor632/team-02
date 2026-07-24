import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router,RouterLink } from '@angular/router';

interface FAQ { q: string; a: string; open: boolean; }

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css'
})
export class FeedbackComponent {
  constructor(private router: Router) {}
  subject = '';
  category = 'General Feedback';
  message = '';
  submitting = false;
  submitted = false;

  categories = ['General Feedback', 'Report an Issue', 'Scheme Query', 'Technical Support', 'Other'];

  faqs: FAQ[] = [
    { q: 'How do I check my scheme eligibility?', a: 'Go to the Eligibility Checker page and fill in your personal, financial, and location details to see matching schemes.', open: false },
    { q: 'How long does it take to hear back on feedback?', a: 'Our support team typically responds within 3-5 working days.', open: false },
    { q: 'Can I track my application status?', a: 'Yes, application status updates appear on your Dashboard under Notifications.', open: false },
    { q: 'Is my data secure on this platform?', a: 'Yes, all data is protected using JWT authentication and role-based access control.', open: false }
  ];

  toggleFaq(faq: FAQ): void {
    faq.open = !faq.open;
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) return;
    this.submitting = true;
    // TODO: real backend call — POST /feedback
    setTimeout(() => {
      this.submitting = false;
      this.submitted = true;
      form.resetForm();
      this.category = 'General Feedback';
    }, 900);
  }
  onLogout(): void {
  const confirmLogout = confirm('Are you sure you want to logout?');
  if (confirmLogout) {
    this.router.navigate(['/login']);
  }
}
}