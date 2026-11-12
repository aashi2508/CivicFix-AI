export type ComplaintStatus = 'Submitted' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolved';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type Category = 'Pothole' | 'Streetlight' | 'Waste Management' | 'Water Supply' | 'Footpath & Curb' | 'Drainage';

export type Complaint = {
  id: string;
  title: string;
  category: Category;
  priority: Priority;
  status: ComplaintStatus;
  location: string;
  ward: string;
  description: string;
  createdAt: string;
  reporter: string;
  image: string;
  aiConfidence: number;
  aiCategory: Category;
  aiSummary: string;
  latitude?: number | null;
  longitude?: number | null;
};

export const statusOptions: ComplaintStatus[] = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];
export const categoryOptions: Category[] = ['Pothole', 'Streetlight', 'Waste Management', 'Water Supply', 'Footpath & Curb', 'Drainage'];
export const priorityOptions: Priority[] = ['Low', 'Medium', 'High', 'Critical'];

export const initialComplaints: Complaint[] = [
  {
    id: 'CF-2026-9968',
    title: 'Footpath & curb structural damage',
    category: 'Footpath & Curb',
    priority: 'High',
    status: 'Submitted',
    location: '12th Main Road, Domlur',
    ward: 'Ward 112',
    description: 'Broken curb and uneven footpath surface is creating a dangerous crossing point near the bus stop.',
    createdAt: 'Today, 10:42 AM',
    reporter: 'Aarav Mehta',
    image: '/demo-complaint.svg',
    aiConfidence: 96,
    aiCategory: 'Footpath & Curb',
    aiSummary: 'Structural pedestrian pathway damage with a visible trip hazard.',
  },
  {
    id: 'CF-2026-9967',
    title: 'Streetlight not working',
    category: 'Streetlight',
    priority: 'Medium',
    status: 'In Progress',
    location: 'Indiranagar 2nd Stage',
    ward: 'Ward 112',
    description: 'The streetlight outside the community park has been off for three nights.',
    createdAt: 'Yesterday, 6:18 PM',
    reporter: 'Nisha Rao',
    image: '/demo-complaint.svg',
    aiConfidence: 91,
    aiCategory: 'Streetlight',
    aiSummary: 'Likely failed streetlight fixture reported in a low-visibility zone.',
  },
  {
    id: 'CF-2026-9964',
    title: 'Overflowing waste collection point',
    category: 'Waste Management',
    priority: 'Critical',
    status: 'Under Review',
    location: '100 Feet Road, Indiranagar',
    ward: 'Ward 112',
    description: 'Public bins are overflowing and waste is spreading onto the pedestrian lane.',
    createdAt: 'Yesterday, 1:05 PM',
    reporter: 'Rohan Kapoor',
    image: '/demo-complaint.svg',
    aiConfidence: 98,
    aiCategory: 'Waste Management',
    aiSummary: 'High-volume waste accumulation requiring sanitation response.',
  },
  {
    id: 'CF-2026-9959',
    title: 'Pothole near school crossing',
    category: 'Pothole',
    priority: 'High',
    status: 'Resolved',
    location: 'HAL 2nd Stage, near public school',
    ward: 'Ward 113',
    description: 'A deep pothole was reported beside a school crossing and has now been repaired.',
    createdAt: 'Nov 08, 2026',
    reporter: 'Maya Singh',
    image: '/demo-complaint.svg',
    aiConfidence: 94,
    aiCategory: 'Pothole',
    aiSummary: 'Road-surface depression with high risk for two-wheelers.',
  },
  {
    id: 'CF-2026-9954',
    title: 'Water leak on service lane',
    category: 'Water Supply',
    priority: 'Medium',
    status: 'Assigned',
    location: 'Koramangala 5th Block',
    ward: 'Ward 114',
    description: 'Continuous water leakage is pooling along the service lane.',
    createdAt: 'Nov 07, 2026',
    reporter: 'Devika Shah',
    image: '/demo-complaint.svg',
    aiConfidence: 89,
    aiCategory: 'Water Supply',
    aiSummary: 'Visible water pooling indicates a probable supply-line leak.',
  },
  {
    id: 'CF-2026-9948',
    title: 'Blocked storm drain',
    category: 'Drainage',
    priority: 'Low',
    status: 'Submitted',
    location: '1st Cross, Domlur Layout',
    ward: 'Ward 112',
    description: 'Leaves and plastic are blocking the storm drain before the rainy season.',
    createdAt: 'Nov 06, 2026',
    reporter: 'Kabir Joshi',
    image: '/demo-complaint.svg',
    aiConfidence: 87,
    aiCategory: 'Drainage',
    aiSummary: 'Drain opening appears obstructed by mixed debris.',
  },
];
