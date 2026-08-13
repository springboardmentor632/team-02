import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FeedbackMessage {
  _id?: string;
  sender?: any;
  senderName?: string;
  senderRole?: string;
  message: string;
  createdAt?: string;
}

export interface FeedbackEntry {
  _id?: string;
  ticketId?: string;
  moduleType?: string; // 'Citizen Feedback' | 'Issue Reporting' | 'Help Desk' | 'FAQ Management' | 'Query Resolution' | 'Contact Support'
  user?: any;
  userRole?: string;
  name?: string;
  email?: string;
  subject: string;
  message: string;
  category?: string;
  priority?: string; // 'Low' | 'Medium' | 'High' | 'Critical'
  rating?: number;
  department?: string;
  status?: string; // 'New' | 'In Progress' | 'Resolved' | 'Closed'
  assignedTo?: any;
  response?: string;
  respondedBy?: any;
  respondedAt?: string;
  resolutionTimeHours?: number;
  messages?: FeedbackMessage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FAQMessage {
  _id?: string;
  sender?: any;
  senderName?: string;
  senderRole?: string;
  message: string;
  createdAt?: string;
}

export interface FAQ {
  _id?: string;
  question: string;
  answer: string;
  category?: string;
  targetRole?: string;
  helpfulCount?: number;
  unhelpfulCount?: number;
  isPublished?: boolean;
  askedByName?: string;
  askedByRole?: string;
  createdBy?: any;
  messages?: FAQMessage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FeedbackStats {
  totalCount: number;
  byModule: Record<string, number>;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byRole: Record<string, number>;
  averageRating: number;
  resolutionRate: number;
  avgResponseTimeHours: number;
  slaCompliancePercent: number;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly baseUrl = `${environment.apiUrl}/feedback`;
  private readonly faqUrl = `${environment.apiUrl}/faqs`;

  constructor(private http: HttpClient) {}

  // ── Feedback Methods ───────────────────────────────────────────────────────
  submit(data: Partial<FeedbackEntry>): Observable<{ feedback: FeedbackEntry }> {
    return this.http.post<{ feedback: FeedbackEntry }>(this.baseUrl, data);
  }

  getAll(paramsObj?: any): Observable<{ feedback: FeedbackEntry[] }> {
    let params = new HttpParams();
    if (paramsObj) {
      Object.keys(paramsObj).forEach(key => {
        if (paramsObj[key] !== undefined && paramsObj[key] !== null && paramsObj[key] !== '') {
          params = params.set(key, paramsObj[key]);
        }
      });
    }
    return this.http.get<{ feedback: FeedbackEntry[] }>(this.baseUrl, { params });
  }

  update(id: string, updateData: any): Observable<{ feedback: FeedbackEntry }> {
    return this.http.put<{ feedback: FeedbackEntry }>(`${this.baseUrl}/${id}`, updateData);
  }

  addMessage(id: string, message: string, response?: string): Observable<{ feedback: FeedbackEntry }> {
    return this.http.post<{ feedback: FeedbackEntry }>(`${this.baseUrl}/${id}/messages`, { message, response });
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  getStats(role?: string): Observable<{ stats: FeedbackStats }> {
    let params = new HttpParams();
    if (role && role !== 'All') {
      params = params.set('role', role);
    }
    return this.http.get<{ stats: FeedbackStats }>(`${this.baseUrl}/stats`, { params });
  }

  // ── FAQ Methods ───────────────────────────────────────────────────────────
  getFaqs(paramsObj?: any): Observable<{ faqs: FAQ[] }> {
    let params = new HttpParams();
    if (paramsObj) {
      Object.keys(paramsObj).forEach(key => {
        if (paramsObj[key] !== undefined && paramsObj[key] !== null && paramsObj[key] !== '') {
          params = params.set(key, paramsObj[key]);
        }
      });
    }
    return this.http.get<{ faqs: FAQ[] }>(this.faqUrl, { params });
  }

  getAdminFaqs(): Observable<{ faqs: FAQ[] }> {
    return this.http.get<{ faqs: FAQ[] }>(`${this.faqUrl}/admin`);
  }

  createFaq(faq: Partial<FAQ>): Observable<{ faq: FAQ }> {
    return this.http.post<{ faq: FAQ }>(this.faqUrl, faq);
  }

  updateFaq(id: string, faq: Partial<FAQ>): Observable<{ faq: FAQ }> {
    return this.http.put<{ faq: FAQ }>(`${this.faqUrl}/${id}`, faq);
  }

  deleteFaq(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.faqUrl}/${id}`);
  }

  voteFaq(id: string, type: 'helpful' | 'unhelpful'): Observable<{ faq: FAQ }> {
    return this.http.post<{ faq: FAQ }>(`${this.faqUrl}/${id}/vote`, { type });
  }

  addFaqMessage(id: string, message: string): Observable<{ faq: FAQ }> {
    return this.http.post<{ faq: FAQ }>(`${this.faqUrl}/${id}/messages`, { message });
  }

  convertQueryToFaq(data: { queryId?: string; question: string; answer: string; category?: string; targetRole?: string }): Observable<{ faq: FAQ }> {
    return this.http.post<{ faq: FAQ }>(`${this.faqUrl}/convert-query`, data);
  }
}
