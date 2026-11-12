
export type CivicCategory =
  | 'Pothole'
  | 'Streetlight'
  | 'Waste Management'
  | 'Water Supply'
  | 'Drainage'
  | 'Road Hazard'
  | 'Traffic Signal'
  | 'Footpath & Curb'
  | 'Other';

export type ComplaintStatus =
  | 'Submitted'
  | 'AI Verified'
  | 'In Progress'
  | 'Resolved'
  | 'Under Review';

export type ComplaintPriority =
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Critical';

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  date: string;
  completed: boolean;
  current?: boolean;
}

export interface ComplaintLocation {
  address: string;
  ward: string;
  latitude: number;
  longitude: number;
}

export interface Complaint {
  id: string;

  // Owner of this complaint
  userId?: string;

  title: string;
  description: string;
  category: CivicCategory;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  confidence: number;
  location: ComplaintLocation;
  imageUri: string;
  createdAt: string;
  updatedAt: string;
  assignedDepartment: string;
  estimatedResolutionTime: string;
  upvotes: number;
  isUpvoted?: boolean;
  isAnonymous?: boolean;
  aiTags: string[];
  timeline: TimelineItem[];
  citizenNotes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type:
    | 'status_change'
    | 'ai_verified'
    | 'team_dispatched'
    | 'resolved'
    | 'announcement';
  complaintId?: string;
  timestamp: string;
  isRead: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  ward: string;
  city: string;
  tier: string;
  points: number;
  reportsFiled: number;
  resolvedCount: number;
  aiAccuracyScore: number;
}

export interface AIAnalysisResult {
  detectedCategory: CivicCategory;
  confidence: number;
  detectedIssueTitle: string;
  recommendedPriority: ComplaintPriority;
  severityLevel: string;
  suggestedDepartment: string;
  estimatedTurnaround: string;
  aiTags: string[];
  safetyHazardIdentified: boolean;
  hazardNotes: string;
  modelIdentifier: string;
}
