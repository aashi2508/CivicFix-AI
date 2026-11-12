import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Complaint, ComplaintPriority, CivicCategory } from '../types';
import { ApiService } from '../services/api';

export interface NewComplaintPayload {
  title: string;
  description: string;
  category: CivicCategory;
  priority: ComplaintPriority;
  confidence: number;
  location: {
    address: string;
    ward: string;
    latitude: number;
    longitude: number;
  };
  imageUri: string;
  assignedDepartment: string;
  isAnonymous?: boolean;
  aiTags: string[];
  citizenNotes?: string;
  estimatedResolutionTime?: string;
  photoFile?: any;
}

interface ComplaintsContextType {
  complaints: Complaint[];
  myComplaints: Complaint[];
  isLoading: boolean;
  isRefreshing: boolean;
  addComplaint: (payload: NewComplaintPayload) => Promise<Complaint>;
  upvoteComplaint: (id: string) => void;
  getComplaintById: (id: string) => Complaint | undefined;
  refreshComplaints: () => Promise<void>;
  resetToInitialMock: () => Promise<void>;
  recentComplaints: Complaint[];
  totalCount: number;
  inProgressCount: number;
  resolvedCount: number;
  pendingCount: number;
  isBackendConnected: boolean;
}

const ComplaintsContext = createContext<ComplaintsContextType>(
  {} as ComplaintsContextType
);

const STORAGE_KEY = '@civicfix_complaints_real_v1';

export const ComplaintsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  const loadFromBackend = useCallback(async () => {
    try {
      // 1. Fetch public/all real complaints for feeds & map
      const remoteComplaints = await ApiService.getComplaints({ scope: 'all' });

      if (Array.isArray(remoteComplaints)) {
        setIsBackendConnected(true);
        setComplaints(remoteComplaints);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remoteComplaints));
      } else {
        await loadFromStorage();
      }

      // 2. Fetch user's own complaints
      try {
        const mine = await ApiService.getComplaints({ scope: 'mine' });
        if (Array.isArray(mine)) {
          setMyComplaints(mine);
        }
      } catch {
        // Non-critical
      }
    } catch (err) {
      console.warn('Backend fetch failed, using cached complaints:', err);
      setIsBackendConnected(false);
      await loadFromStorage();
    }
  }, []);

  const loadFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setComplaints(parsed);
          return;
        }
      }
      setComplaints([]);
    } catch {
      setComplaints([]);
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await loadFromBackend();
      setIsLoading(false);
    })();

    // Poll every 12 seconds to sync live status updates from Admin Dashboard
    const interval = setInterval(() => {
      loadFromBackend();
    }, 12000);

    return () => clearInterval(interval);
  }, [loadFromBackend]);

  const refreshComplaints = async () => {
    setIsRefreshing(true);
    await loadFromBackend();
    setIsRefreshing(false);
  };

  const addComplaint = async (
    payload: NewComplaintPayload
  ): Promise<Complaint> => {
    let createdRecord: Complaint | null = null;

    try {
      // Send to Backend API
      createdRecord = await ApiService.createComplaint({
        title: payload.title || `${payload.category} Issue Reported`,
        description: payload.description,
        category: payload.category,
        priority: payload.priority || 'Medium',
        latitude: payload.location.latitude,
        longitude: payload.location.longitude,
        address: payload.location.address,
        photoUrl: payload.imageUri,
        confidence: payload.confidence || 95.5,
        aiCategory: payload.category,
        aiSummary: payload.citizenNotes || `Identified ${payload.category} with ${(payload.confidence || 95.5).toFixed(1)}% match.`,
        photoFile: payload.photoFile,
      });

      setIsBackendConnected(true);
    } catch (err) {
      console.warn('API complaint creation failed, creating local fallback:', err);
    }

    // If backend succeeded, use its real DB record, else create robust local record
    const finalComplaint: Complaint = createdRecord || {
      id: `CF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: payload.title || `${payload.category} Issue Reported`,
      description: payload.description,
      category: payload.category,
      status: 'Submitted',
      priority: payload.priority || 'Medium',
      confidence: payload.confidence || 95.5,
      location: payload.location,
      imageUri: payload.imageUri,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      updatedAt: new Date().toISOString(),
      assignedDepartment: payload.assignedDepartment || 'Municipal Civic Command Centre',
      estimatedResolutionTime: payload.estimatedResolutionTime || '48 - 72 Hours',
      upvotes: 1,
      isUpvoted: true,
      isAnonymous: payload.isAnonymous || false,
      aiTags: payload.aiTags || [`#${payload.category.replace(/\s+/g, '')}`],
      citizenNotes: payload.citizenNotes,
      timeline: [
        {
          id: 'step-1',
          title: 'Complaint Lodged',
          description: 'Logged via CivicFix AI mobile client',
          date: 'Just now',
          completed: true,
          current: true,
        },
        {
          id: 'step-2',
          title: 'AI Vision & Sensor Triage',
          description: `Identified ${payload.category} (${(payload.confidence || 95.5).toFixed(1)}% match)`,
          date: 'Automated Real-time',
          completed: true,
        },
        {
          id: 'step-3',
          title: 'Department Routing',
          description: `Assigned to ${payload.assignedDepartment || 'Municipal Maintenance'}`,
          date: 'Queued',
          completed: false,
        },
        {
          id: 'step-4',
          title: 'Field Team Resolution',
          description: 'On-site remediation & verification',
          date: 'Pending',
          completed: false,
        },
      ],
    };

    const updated = [finalComplaint, ...complaints.filter(c => c.id !== finalComplaint.id)];
    setComplaints(updated);
    setMyComplaints(prev => [finalComplaint, ...prev.filter(c => c.id !== finalComplaint.id)]);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    return finalComplaint;
  };

  const upvoteComplaint = (id: string) => {
    const updated = complaints.map(c => {
      if (c.id === id) {
        const isUpvoted = !c.isUpvoted;
        return {
          ...c,
          isUpvoted,
          upvotes: isUpvoted ? c.upvotes + 1 : Math.max(0, c.upvotes - 1),
        };
      }
      return c;
    });
    setComplaints(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const getComplaintById = (id: string) => {
    return complaints.find(c => c.id === id);
  };

  const resetToInitialMock = async () => {
    await loadFromBackend();
  };

  const recentComplaints = complaints.slice(0, 4);
  const totalCount = complaints.length;
  const inProgressCount = complaints.filter(
    c => c.status === 'In Progress' || c.status === 'AI Verified'
  ).length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const pendingCount = complaints.filter(c => c.status === 'Submitted').length;

  return (
    <ComplaintsContext.Provider
      value={{
        complaints,
        myComplaints,
        isLoading,
        isRefreshing,
        addComplaint,
        upvoteComplaint,
        getComplaintById,
        refreshComplaints,
        resetToInitialMock,
        recentComplaints,
        totalCount,
        inProgressCount,
        resolvedCount,
        pendingCount,
        isBackendConnected,
      }}
    >
      {children}
    </ComplaintsContext.Provider>
  );
};

export const useComplaints = () => useContext(ComplaintsContext);
