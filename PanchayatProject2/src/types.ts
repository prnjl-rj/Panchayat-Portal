export interface Complaint {
  id: string;
  residentName: string;
  flatNumber: string;
  text: string;
  summary: string;
  audioUrl?: string; // If recorded
  isAudio?: boolean;
  category: 'Plumbing' | 'Electrical' | 'Security' | 'Sanitation' | 'Rules infraction' | 'Others';
  severity: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Resolved';
  timestamp: string;
  responseText?: string;
}

export interface ServiceStaff {
  id: string;
  name: string;
  category: 'Plumber' | 'Laundry' | 'Electrician' | 'Housekeeping' | 'Security' | 'Car Wash' | 'Pest Control';
  rating: number;
  contactName: string;
  phone: string;
  isAvailable: boolean;
  avatar: string;
  experienceYears: number;
  baseCharge: string;
}

export interface ServiceRequest {
  id: string;
  staffId: string;
  staffName: string;
  category: string;
  flatNumber: string;
  timeSlot: string;
  status: 'Requested' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';
  timestamp: string;
  notes?: string;
  paymentStatus?: 'Unpaid' | 'Processing' | 'Paid';
  amount?: number;
  transactionId?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'complaint' | 'service' | 'announcement' | 'visitor';
  isRead: boolean;
  timestamp: string;
}

export interface SocietyRule {
  category: string;
  title: string;
  detail: string;
}

export interface Rulebook {
  societyName: string;
  address: string;
  rules: SocietyRule[];
}

export interface VisitorRecord {
  id: string;
  visitorName: string;
  purpose: string;
  flatNumber: string;
  entryTime: string;
  status: 'Pre-Approved' | 'Waiting at Gate' | 'Approved' | 'Denied' | 'Checked Out';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  sender: string;
  date: string;
  priority: 'High' | 'Normal';
}

export interface Transaction {
  id: string;
  requestId: string;
  staffName: string;
  category: string;
  amount: number;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking';
  status: 'Success' | 'Failed' | 'Processing';
  timestamp: string;
  transactionId: string;
}

export interface Society {
  id: string;
  name: string;
  address: string;
  city: string;
  adminName: string;
  adminPhone: string;
  unitsCount: number;
  registeredAt: string;
  rulesText?: string;
  rules?: SocietyRule[];
  subscriptionType?: 'Free' | '1Month' | '4Months' | '1Year' | 'None';
  adminEmail?: string;
  adminPassword?: string;
  amenities?: { name: string; timing: string }[];
}

export interface ResidentRegistry {
  societyId: string;
  name: string;
  flatNumber: string;
  email: string;
  phone: string;
  age?: number;
  gender?: string;
  familyMembers?: string[];
  password?: string;
}

export interface AppUser {
  id: string;
  societyId: string;
  name: string;
  flatNumber: string;
  email: string;
  phone: string;
  isRegisteredResident: boolean;
  subscriptionType: 'Free' | '1Month' | '4Months' | '1Year' | 'None';
  subscriptionExpiresAt: string;
  createdAt: string;
  age?: number;
  gender?: string;
  familyMembers?: string[];
  role?: 'resident' | 'admin';
  password?: string;
  profilePictureUrl?: string;
}

export interface SosAlert {
  id: string;
  societyId: string;
  residentName: string;
  flatNumber: string;
  phone: string;
  locationDetails: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  status: 'Active' | 'Resolved';
}

export interface ChatMessage {
  id: string;
  societyId: string;
  senderId: string;
  senderName: string;
  senderFlat: string;
  text: string;
  timestamp: string;
}

