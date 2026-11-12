import AsyncStorage from '@react-native-async-storage/async-storage';
import { Complaint, ComplaintPriority, ComplaintStatus, CivicCategory } from '../types';

export const API_HOST = 'http://localhost:4000';
export const API_BASE_URL = `${API_HOST}/api`;

const TOKEN_KEY = '@civicfix_jwt_token';

// Helper to resolve image URL if it's relative
export const resolveImageUrl = (photoUrl?: string | null): string => {
  if (!photoUrl) {
    return 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80';
  }
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://') || photoUrl.startsWith('data:')) {
    return photoUrl;
  }
  return `${API_HOST}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
};

// Map backend status to frontend display status
export const mapBackendStatusToFrontend = (status: string): ComplaintStatus => {
  switch (status) {
    case 'SUBMITTED':
      return 'Submitted';
    case 'IN_REVIEW':
      return 'AI Verified';
    case 'ASSIGNED':
      return 'In Progress';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'RESOLVED':
      return 'Resolved';
    case 'REJECTED':
      return 'Under Review';
    default:
      return 'Submitted';
  }
};

// Map backend priority to frontend display priority
export const mapBackendPriorityToFrontend = (priority: string): ComplaintPriority => {
  switch (priority) {
    case 'LOW':
      return 'Low';
    case 'MEDIUM':
      return 'Medium';
    case 'HIGH':
      return 'High';
    case 'URGENT':
      return 'Critical';
    default:
      return 'Medium';
  }
};

// Map frontend priority to backend enum
export const mapFrontendPriorityToBackend = (priority: string): string => {
  switch (priority) {
    case 'Low':
      return 'LOW';
    case 'Medium':
      return 'MEDIUM';
    case 'High':
      return 'HIGH';
    case 'Critical':
      return 'URGENT';
    default:
      return 'MEDIUM';
  }
};

// Map backend complaint response to frontend Complaint model
export const transformBackendComplaint = (raw: any): Complaint => {
  const latestAi = raw.aiAnalyses && raw.aiAnalyses.length > 0 ? raw.aiAnalyses[0] : null;
  const confidence = latestAi
    ? latestAi.confidence > 1
      ? latestAi.confidence
      : latestAi.confidence * 100
    : 96.0;

  const status = mapBackendStatusToFrontend(raw.status);
  const priority = mapBackendPriorityToFrontend(raw.priority);

  const createdAtFormatted = raw.createdAt
    ? new Date(raw.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  // Build department based on category
  const getDepartment = (cat: string) => {
    switch (cat) {
      case 'Pothole':
      case 'Road Hazard':
      case 'POTHOLE':
        return 'BBMP Major Roads & Infrastructure';
      case 'Streetlight':
      case 'STREETLIGHT':
        return 'BESCOM Electrical Maintenance Wing';
      case 'Waste Management':
      case 'GARBAGE':
        return 'Solid Waste Management (SWM) Division';
      case 'Water Supply':
      case 'WATER_LEAKAGE':
        return 'BWSSB Water Pipeline Rapid Response';
      default:
        return 'Ward Municipal Infrastructure Division';
    }
  };

  // Build timeline
  const isResolved = raw.status === 'RESOLVED';
  const isInProgress = raw.status === 'IN_PROGRESS' || raw.status === 'ASSIGNED';
  const isInReview = raw.status === 'IN_REVIEW' || latestAi != null;

  const timeline = [
    {
      id: 'step-1',
      title: 'Complaint Lodged',
      description: `Submitted by ${raw.user?.name || 'Citizen'} via CivicFix AI`,
      date: createdAtFormatted,
      completed: true,
      current: raw.status === 'SUBMITTED',
    },
    {
      id: 'step-2',
      title: 'AI Vision & Sensor Triage',
      description: latestAi?.summary || `Neural match: ${confidence.toFixed(1)}% confidence`,
      date: 'Automated Real-time',
      completed: isInReview || isInProgress || isResolved,
      current: raw.status === 'IN_REVIEW',
    },
    {
      id: 'step-3',
      title: 'Department Assigned',
      description: `Routing order issued to ${getDepartment(raw.category)}`,
      date: isInProgress || isResolved ? 'Active' : 'Pending',
      completed: isInProgress || isResolved,
      current: raw.status === 'ASSIGNED',
    },
    {
      id: 'step-4',
      title: 'Field Team Remediation',
      description: 'On-site municipal crew execution & progress log',
      date: isInProgress ? 'In Progress' : isResolved ? 'Completed' : 'Pending',
      completed: isResolved,
      current: raw.status === 'IN_PROGRESS',
    },
    {
      id: 'step-5',
      title: 'Resolution Verified',
      description: isResolved ? 'Confirmed and closed by municipal engineer' : 'Awaiting final work order sign-off',
      date: isResolved ? 'Resolved' : 'Pending',
      completed: isResolved,
      current: isResolved,
    },
  ];

  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    category: (raw.category as CivicCategory) || 'Pothole',
    status,
    priority,
    confidence,
    location: {
      address: raw.address || 'Near Ward 112 Center, Bengaluru',
      ward: 'Ward 112 - Domlur / Indiranagar',
      latitude: raw.latitude || 12.9716,
      longitude: raw.longitude || 77.6412,
    },
    imageUri: resolveImageUrl(raw.photoUrl),
    createdAt: createdAtFormatted,
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : createdAtFormatted,
    assignedDepartment: getDepartment(raw.category),
    estimatedResolutionTime: isResolved ? 'Resolved' : priority === 'Critical' ? '12 - 24 Hours' : '24 - 48 Hours',
    upvotes: 14 + (raw.statusHistory?.length || 1) * 3,
    isUpvoted: false,
    isAnonymous: false,
    aiTags: [
      `#${(raw.category || 'Civic').replace(/\s+/g, '')}`,
      `#Priority${priority}`,
      '#Ward112',
    ],
    timeline,
    citizenNotes: raw.description,
  };
};

export class ApiService {
  private static async getHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  static async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  static async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  }

  static async clearToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }

  // Auth: Login
  static async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
    });

    const data = (await res.json()) as any;
    if (!res.ok) {
      throw new Error(data.error || 'Failed to sign in. Please verify your credentials.');
    }

    if (data.token) {
      await this.setToken(data.token);
    }
    return data;
  }

  // Auth: Register
  static async register(name: string, email: string, password: string): Promise<{ token: string; user: any }> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
      }),
    });

    const data = (await res.json()) as any;
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed. Please check the details entered.');
    }

    if (data.token) {
      await this.setToken(data.token);
    }
    return data;
  }

  // Complaints: Get All
  static async getComplaints(options: {
    scope?: 'all' | 'mine';
    status?: string;
    category?: string;
    q?: string;
  } = {}): Promise<Complaint[]> {
    const headers = await this.getHeaders();
    const query = new URLSearchParams();
    if (options.scope) query.append('scope', options.scope);
    if (options.status && options.status !== 'All') query.append('status', options.status);
    if (options.category && options.category !== 'All') query.append('category', options.category);
    if (options.q) query.append('q', options.q);

    const url = `${API_BASE_URL}/complaints${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url, { headers });

    if (!res.ok) {
      throw new Error(`Failed to load complaints (${res.status})`);
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(transformBackendComplaint);
  }

  // Complaints: Get Single
  static async getComplaintById(id: string): Promise<Complaint> {
    const headers = await this.getHeaders();
    const res = await fetch(`${API_BASE_URL}/complaints/${id}`, { headers });
    if (!res.ok) {
      throw new Error(`Complaint not found (${res.status})`);
    }
    const data = await res.json();
    return transformBackendComplaint(data);
  }

  // Complaints: Create (supports JSON body or multipart FormData)
  static async createComplaint(payload: {
    title: string;
    description: string;
    category: string;
    priority: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    photoUrl?: string;
    confidence?: number;
    aiCategory?: string;
    aiSummary?: string;
    photoFile?: any; // local asset from react-native-image-picker
  }): Promise<Complaint> {
    const token = await this.getToken();

    // If a local image file asset was picked or local camera URI exists, upload via multipart FormData
    const localUri =
      payload.photoFile?.uri ||
      (payload.photoUrl && (payload.photoUrl.startsWith('file://') || payload.photoUrl.startsWith('content://'))
        ? payload.photoUrl
        : null);

    if (localUri) {
      try {
        const formData = new FormData();
        formData.append('title', payload.title);
        formData.append('description', payload.description);
        formData.append('category', payload.category);
        formData.append('priority', mapFrontendPriorityToBackend(payload.priority));
        if (payload.latitude != null) formData.append('latitude', String(payload.latitude));
        if (payload.longitude != null) formData.append('longitude', String(payload.longitude));
        if (payload.address) formData.append('address', payload.address);
        if (payload.confidence != null) formData.append('confidence', String(payload.confidence));
        if (payload.aiCategory) formData.append('aiCategory', payload.aiCategory);
        if (payload.aiSummary) formData.append('aiSummary', payload.aiSummary);

        formData.append('photo', {
          uri: localUri,
          type: payload.photoFile?.type || 'image/jpeg',
          name: payload.photoFile?.fileName || `report_${Date.now()}.jpg`,
        } as any);

        const res = await fetch(`${API_BASE_URL}/complaints`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData as any,
        });

        const data = (await res.json()) as any;
        if (res.ok) {
          return transformBackendComplaint(data);
        }
      } catch (uploadErr) {
        console.warn('Multipart upload failed, falling back to JSON base64:', uploadErr);
      }
    }

    // Otherwise send as standard JSON (with base64 image support)
    const headers = await this.getHeaders();
    const finalPhotoUrl =
      payload.photoFile?.base64
        ? `data:image/jpeg;base64,${payload.photoFile.base64}`
        : payload.photoUrl;

    const res = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: payload.title,
        description: payload.description,
        category: payload.category,
        priority: mapFrontendPriorityToBackend(payload.priority),
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address,
        photoUrl: finalPhotoUrl,
        confidence: payload.confidence,
        aiCategory: payload.aiCategory,
        aiSummary: payload.aiSummary,
      }),
    });

    const data = (await res.json()) as any;
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit complaint');
    }
    return transformBackendComplaint(data);
  }

  // Summary statistics from backend
  static async getSummaryStats(): Promise<{
    total: number;
    submitted: number;
    inProgress: number;
    resolved: number;
    aiAccuracy: number;
  }> {
    const res = await fetch(`${API_BASE_URL}/complaints/stats/summary`);
    if (!res.ok) {
      throw new Error('Failed to load stats summary');
    }
    return (await res.json()) as any;
  }

  // Map markers from backend
  static async getMapMarkers(): Promise<Array<{
    id: string;
    title: string;
    category: string;
    status: string;
    latitude: number;
    longitude: number;
  }>> {
    const res = await fetch(`${API_BASE_URL}/complaints/map`);
    if (!res.ok) {
      throw new Error('Failed to load map markers');
    }
    return (await res.json()) as any;
  }

  // Live real-time notification feed
  static async getNotifications(): Promise<Array<{
    id: string;
    complaintId?: string;
    title: string;
    message: string;
    timestamp: string;
    isRead?: boolean;
    type: 'ai_verified' | 'team_dispatched' | 'resolved' | 'announcement' | 'status_update';
    category?: string;
  }>> {
    try {
      const headers = await this.getHeaders();
      const res = await fetch(`${API_BASE_URL}/complaints/notifications/feed`, { headers });
      if (!res.ok) return [];
      return (await res.json()) as any[];
    } catch {
      return [];
    }
  }
}
