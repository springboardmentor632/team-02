export interface Policy {
  _id: string;
  title: string;
  summary?: string;
  content?: string;
  category: string;
  ministry?: string;
  department?: string;
  state?: string;
  publishedAt?: string;
  status: 'Draft' | 'Pending' | 'Active' | 'Archived';
  tags?: string[];
  attachments?: string[];
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Scheme {
  _id: string;
  name: string;
  summary?: string;
  details?: string;
  category: string;
  ministry?: string;
  department?: string;
  state?: string;
  eligibilityCriteria?: string[];
  benefits?: string[];
  applicationMode?: string;
  launchDate?: string;
  status: 'Draft' | 'Pending' | 'Active' | 'Archived';
  tags?: string[];
  attachments?: string[];
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EligibilityRule {
  _id: string;
  scheme: string | Scheme;
  ageRange?: { min?: number; max?: number };
  gender?: string;
  incomeLimit?: string;
  occupation?: string;
  education?: string;
  location?: string;
  socialCategory?: string;
  disabilityStatus?: string;
}

export interface SearchResult {
  id: string;
  type: 'policy' | 'scheme';
  name: string;
  icon: string;
  ministry: string;
  launchYear: string;
  desc: string;
  tags: string[];
  scope: string;
  status: string;
  category: string;
}

export interface EligibilityCheckPayload {
  age: number;
  gender: string;
  income: number;
  occupation: string;
  education: string;
  location: string;
  socialCategory: string;
  disabilityStatus: string;
}

export interface EligibilityMatch {
  scheme: Scheme;
  rule: EligibilityRule;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  category?: string;
  read: boolean;
  sentAt: string;
  link?: string;
}

export interface PlatformStats {
  policies: number;
  schemes: number;
  states: number;
  users: number;
  pendingPolicies: number;
  totalPolicies: number;
}
