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
  documentsRequired?: string[];
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
  category?: 'policy_alert' | 'scheme_update' | 'deadline_reminder' | 'application_update' | 'system' | string;
  channels?: ('in_app' | 'email' | 'sms')[];
  deliveryStatus?: {
    email?: string;
    sms?: string;
    inApp?: string;
  };
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

export interface EligibilityProfile {
  age: number;
  gender: string;
  income: number;
  occupation: string;
  education: string;
  location: string;
  socialCategory: string;
  disabilityStatus: string;
  state?: string;
  district?: string;
  areaType?: string;
}

export interface ApplicationFormData {
  address: string;
  aadhaarNumber: string;
  bankAccount: string;
  additionalNotes: string;
  documentsAcknowledged: boolean;
}

export interface SchemeApplication {
  _id: string;
  user: string;
  applicationType?: 'scheme' | 'policy';
  policy?: Policy | string;
  scheme: Scheme | string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  eligibilitySnapshot: EligibilityProfile;
  formData: ApplicationFormData;
  govNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}
