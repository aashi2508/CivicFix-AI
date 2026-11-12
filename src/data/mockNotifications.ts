import { NotificationItem } from '../types';

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'AI Analysis Complete',
    message:
      'CivicFix Vision model classified your report #CF-2026-9842 as "Severe Pothole" with 96.8% confidence. High priority assigned.',
    type: 'ai_verified',
    complaintId: 'CF-2026-9842',
    timestamp: '15 mins ago',
    isRead: false,
  },
  {
    id: 'n2',
    title: 'Field Team Dispatched',
    message:
      'BBMP Rapid Action Road Repair crew has been deployed to Indiranagar 100ft Road for complaint #CF-2026-9842.',
    type: 'team_dispatched',
    complaintId: 'CF-2026-9842',
    timestamp: '2 hours ago',
    isRead: false,
  },
  {
    id: 'n3',
    title: 'Issue Resolved & Verified',
    message:
      'Complaint #CF-2026-9651 (Illegal Commercial Garbage Dumping) has been cleared and sanitized. Tap to review photo proof.',
    type: 'resolved',
    complaintId: 'CF-2026-9651',
    timestamp: 'Yesterday',
    isRead: true,
  },
  {
    id: 'n4',
    title: 'Civic Impact Milestone',
    message:
      'You reached Level 4 Civic Guardian! Your reports have expedited 5 municipal fixes in Ward 112.',
    type: 'announcement',
    timestamp: '2 days ago',
    isRead: true,
  },
  {
    id: 'n5',
    title: 'Community Upvote Alert',
    message:
      '12 citizens upvoted your water leakage report on MG Road Boulevard. Escalation boosted.',
    type: 'status_change',
    complaintId: 'CF-2026-9520',
    timestamp: '3 days ago',
    isRead: true,
  },
];
