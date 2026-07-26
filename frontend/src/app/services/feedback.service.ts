import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FeedbackEntry {
  _id?: string;
  name?: string;
  email?: string;
  subject: string;
  message: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly baseUrl = `${environment.apiUrl}/feedback`;

  constructor(private http: HttpClient) {}

  submit(data: FeedbackEntry): Observable<{ feedback: FeedbackEntry }> {
    return this.http.post<{ feedback: FeedbackEntry }>(this.baseUrl, data);
  }
}
