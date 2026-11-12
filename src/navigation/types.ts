import { NavigatorScreenParams } from '@react-navigation/native';
import { ComplaintLocation, ComplaintPriority } from '../types';

export type MainTabParamList = {
  Home: undefined;
  Map: undefined;
  ReportTab: undefined;
  MyComplaints: { initialFilter?: string } | undefined;
  Profile: undefined;
};

export interface AIAnalysisScreenParams {
  imageUri: string;
  category: string;
  description: string;
  location: ComplaintLocation;
}

export interface ReviewSubmitScreenParams {
  analysisData: {
    imageUri: string;
    category: string;
    title: string;
    description: string;
    location: ComplaintLocation;
    priority: ComplaintPriority;
    confidence: number;
    department: string;
    tags: string[];
    turnaround: string;
  };
}

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  ReportIssue: undefined;
  AIAnalysisPreview: AIAnalysisScreenParams;
  ReviewSubmit: ReviewSubmitScreenParams;
  ComplaintDetails: { complaintId: string };
  Notifications: undefined;
};
