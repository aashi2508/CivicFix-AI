import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AlertTriangle, ArrowLeft, BarChart3, Bell, Bot, Check, ChevronDown, ChevronRight,
  CircleHelp, ClipboardList, Clock3, Eye, FileCheck2, Filter, ImageOff, LayoutDashboard,
  Lightbulb, ListFilter, LogOut, Map, Menu, MoreHorizontal, PackageCheck, PanelLeftClose,
  PanelLeftOpen, Pencil, Plus, Search, Settings, ShieldCheck, Sparkles, Target, UserRound,
  X, Zap
} from 'lucide-react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts';
import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  categoryOptions, priorityOptions, statusOptions,
  type Category, type Complaint, type ComplaintStatus, type Priority
} from './data';

type AdminProfile = {
  name: string;
  email: string;
  role: string;
};

type AppContextValue = {
  complaints: Complaint[];
  updateComplaint: (id: string, patch: Partial<Complaint>) => void;
  approveAI: (id: string) => Promise<void>;
  runAIReview: (id: string) => Promise<any>;
  refreshComplaints: () => Promise<void>;
  apiRequest: (path: string, init?: RequestInit) => Promise<any>;
  adminProfile: AdminProfile;
  updateAdminProfile: (patch: Partial<AdminProfile>) => void;
};
const AppContext = createContext<AppContextValue | null>(null);
const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('App context is unavailable');
  return context;
};

const cn = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(' ');
const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const tokenStorageKey = 'civicfix.adminToken';
const resolveImageUrl = (src: string) => {
  if (!src) return '/demo-complaint.svg';
  if (/^(https?:|data:|blob:)/i.test(src)) return src;
  if (src.startsWith('/uploads/')) return `${backendUrl.replace(/\/$/, '')}${src}`;
  if (src.startsWith('uploads/')) return `${backendUrl.replace(/\/$/, '')}/${src}`;
  return src;
};
function ComplaintImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [failed, setFailed] = useState(false);
  const url = resolveImageUrl(src);
  if (failed || !url || url.startsWith('file://') || url.startsWith('content://')) {
    return <img src="/demo-complaint.svg" alt={alt} className={cn('object-cover bg-slate-900', className)} />;
  }
  return <img src={url} alt={alt} loading="lazy" onError={() => setFailed(true)} className={className} />;
}
const enumStatus: Record<string, ComplaintStatus> = { SUBMITTED: 'Submitted', IN_REVIEW: 'Under Review', ASSIGNED: 'Assigned', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved' };
const enumPriority: Record<string, Priority> = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical', URGENT: 'Critical' };
const enumCategory: Record<string, Category> = { POTHOLE: 'Pothole', ROAD_DAMAGE: 'Footpath & Curb', GARBAGE: 'Waste Management', STREETLIGHT: 'Streetlight', WATER_LEAKAGE: 'Water Supply', DRAINAGE: 'Drainage' };

const getTimeGreeting = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  if (h >= 17 && h < 21) return 'Good evening';
  return 'Good night';
};
function normalizeComplaint(value: Record<string, unknown>): Complaint | null {
  const id = typeof value.id === 'string' ? value.id : null;
  const title = typeof value.title === 'string' ? value.title : null;
  if (!id || !title) return null;
  const categoryKey = typeof value.category === 'string' ? value.category : '';
  const priorityKey = typeof value.priority === 'string' ? value.priority : 'MEDIUM';
  const statusKey = typeof value.status === 'string' ? value.status : 'SUBMITTED';
  const user = value.user as Record<string, unknown> | undefined;
  const analyses = Array.isArray(value.aiAnalyses) ? value.aiAnalyses as Array<Record<string, unknown>> : [];
  const latestAnalysis = analyses[0];
  const aiCategoryKey = typeof value.aiCategory === 'string' ? value.aiCategory : (typeof latestAnalysis?.category === 'string' ? latestAnalysis.category : '');
  const aiSummary = typeof value.aiSummary === 'string' ? value.aiSummary : (typeof latestAnalysis?.summary === 'string' ? latestAnalysis.summary : 'AI analysis has not been run yet.');
  return {
    id, title,
    category: enumCategory[categoryKey] ?? (categoryKey as Category),
    priority: enumPriority[priorityKey] ?? 'Medium',
    status: enumStatus[statusKey] ?? 'Submitted',
    location: typeof value.address === 'string' && value.address ? value.address : 'Location not provided',
    ward: 'Unassigned',
    description: typeof value.description === 'string' ? value.description : '',
    createdAt: typeof value.createdAt === 'string' ? new Date(value.createdAt).toLocaleString() : 'Recently',
    reporter: typeof user?.name === 'string' ? user.name : 'Citizen',
    image: typeof value.photoUrl === 'string' && value.photoUrl ? value.photoUrl : '/demo-complaint.svg',
    aiConfidence: typeof latestAnalysis?.confidence === 'number' ? Math.round(Number(latestAnalysis.confidence) * 100) : (typeof value.aiConfidence === 'number' ? Math.round(value.aiConfidence * 100) : 0),
    aiCategory: enumCategory[aiCategoryKey] ?? (aiCategoryKey ? aiCategoryKey as Category : 'Pothole'),
    aiSummary,
    latitude: typeof value.latitude === 'number' ? value.latitude : null,
    longitude: typeof value.longitude === 'number' ? value.longitude : null,
  };
}
async function loadAdminComplaints(): Promise<Complaint[] | null> {
  const token = localStorage.getItem(tokenStorageKey);
  if (!token) return null;
  const response = await fetch(`${backendUrl.replace(/\/$/, '')}/api/complaints`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) return null;
  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) return null;
  return payload.map(item => normalizeComplaint(item as Record<string, unknown>)).filter((item): item is Complaint => item !== null);
}
const statusClass: Record<ComplaintStatus, string> = {
  Submitted: 'bg-blue-400/10 text-blue-300 border-blue-400/20',
  'Under Review': 'bg-violet-400/10 text-violet-300 border-violet-400/20',
  Assigned: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
  'In Progress': 'bg-cyan/10 text-cyan border-cyan/20',
  Resolved: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
};
const priorityClass: Record<Priority, string> = {
  Low: 'text-slate-400', Medium: 'text-amber-300', High: 'text-orange-300', Critical: 'text-rose-300',
};

function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-2.5">
    <img src="/civicfix-logo.png" alt="CivicFix AI" className="h-10 w-10 rounded-xl object-contain" />
    {!compact && <div><p className="text-sm font-extrabold tracking-tight text-white">CivicFix <span className="text-cyan">AI</span></p><p className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-500">Admin console</p></div>}
  </div>;
}
function StatusBadge({ status }: { status: ComplaintStatus }) { return <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold', statusClass[status])}><span className="h-1.5 w-1.5 rounded-full bg-current" />{status}</span>; }
function PriorityText({ priority }: { priority: Priority }) { return <span className={cn('inline-flex items-center gap-1.5 text-xs font-bold', priorityClass[priority])}><span className="h-1.5 w-1.5 rounded-full bg-current" />{priority}</span>; }
function DemoLabel() { return <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/20 bg-violet-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-300"><Bot size={11} /> Demo data</span>; }

const navItems = [
  { label: 'Overview', path: '/', icon: LayoutDashboard },
  { label: 'Complaints', path: '/complaints', icon: ClipboardList },
  { label: 'Users', path: '/users', icon: UserRound },
  { label: 'AI Review Center', path: '/ai-review', icon: Bot, badge: '12' },
  { label: 'Status Management', path: '/status', icon: ListFilter },
  { label: 'Map View', path: '/map', icon: Map },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
];
function Shell() {
  const { complaints, adminProfile } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(new Set());
  const location = useLocation();
  const navigate = useNavigate();
  const active = location.pathname;
  if (!localStorage.getItem(tokenStorageKey)) return <Navigate to="/login" replace />;

  const adminInitials = adminProfile.name
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AD';
  const adminFirstName = adminProfile.name.split(' ')[0] || 'Admin';

  const liveNotifs = useMemo(() => {
    return complaints.slice(0, 10).map((c) => ({
      id: `admin-notif-${c.id}`,
      title: c.status === 'Resolved' ? `Resolved: ${c.title}` : c.status === 'In Progress' ? `In Progress: ${c.title}` : `New Report: ${c.title}`,
      time: c.createdAt || 'Recent',
      status: c.status,
      category: c.category,
      complaintId: c.id,
      reporter: c.reporter,
      location: c.location,
      priority: c.priority,
      isRead: readNotifIds.has(`admin-notif-${c.id}`),
    }));
  }, [complaints, readNotifIds]);

  const unreadCount = liveNotifs.filter(n => !n.isRead).length;
  const markAllRead = () => {
    setReadNotifIds(new Set(liveNotifs.map(n => n.id)));
  };

  return <div className="min-h-screen bg-navy">
    <aside className={cn('fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/[.07] bg-[#0b1226] transition-all duration-300', collapsed && 'w-[76px]', mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
      <div className="flex h-[76px] items-center justify-between border-b border-white/[.07] px-5">{!collapsed && <Logo />} {collapsed && <Logo compact />}
        <button onClick={() => setCollapsed(!collapsed)} className="hidden rounded-lg p-2 text-slate-500 hover:bg-white/[.06] hover:text-white lg:block">{collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}</button>
        <button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-slate-500 hover:text-white lg:hidden"><X size={18} /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-6">
        {!collapsed && <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-600">Workspace</p>}
        <nav className="space-y-1">{navItems.map(item => { const Icon = item.icon; const selected = item.path === '/' ? active === '/' : active.startsWith(item.path); return <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)} className={cn('group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition', selected ? 'bg-cyan/[.1] text-cyan' : 'text-slate-400 hover:bg-white/[.05] hover:text-white', collapsed && 'justify-center px-0')} title={collapsed ? item.label : undefined}><Icon size={18} /><span className={cn(collapsed && 'hidden')}>{item.label}</span>{item.badge && !collapsed && <span className="ml-auto rounded-full bg-violet-400/15 px-2 py-0.5 text-[10px] text-violet-300">{item.badge}</span>}</Link>; })}</nav>
        {!collapsed && <p className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-600">System</p>}
        <nav className="space-y-1">
          <Link to="/settings" onClick={() => setMobileOpen(false)} className={cn('flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/[.05] hover:text-white', collapsed && 'justify-center px-0')}><Settings size={18} /><span className={cn(collapsed && 'hidden')}>Settings</span></Link>
          <Link to="/profile" onClick={() => setMobileOpen(false)} className={cn('flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/[.05] hover:text-white', collapsed && 'justify-center px-0')}><UserRound size={18} /><span className={cn(collapsed && 'hidden')}>Admin Profile</span></Link>
        </nav>
      </div>
      <div className={cn('border-t border-white/[.07] p-4', collapsed && 'px-2')}>
        {!collapsed && <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/[.04] p-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-electric text-sm font-bold">{adminInitials}</div><div className="min-w-0"><p className="truncate text-xs font-bold">{adminProfile.name}</p><p className="truncate text-[10px] text-slate-500">{adminProfile.role}</p></div></div>}
        <button onClick={() => { localStorage.removeItem(tokenStorageKey); navigate('/login'); }} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-rose-400/10 hover:text-rose-300', collapsed && 'justify-center px-0')}><LogOut size={16} /><span className={cn(collapsed && 'hidden')}>Sign out</span></button>
      </div>
    </aside>
    <div className={cn('min-h-screen transition-all duration-300', collapsed ? 'lg:pl-[76px]' : 'lg:pl-64')}>
      <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-white/[.07] bg-navy/85 px-4 backdrop-blur-xl sm:px-8">
        <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-slate-400 hover:bg-white/[.06] lg:hidden"><Menu size={21} /></button>
        <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex"><span className="h-2 w-2 rounded-full bg-cyan shadow-[0_0_10px_#00f5d4]" /> Operations workspace <ChevronRight size={14} /></div>
        <div className="ml-auto flex items-center gap-3 relative">
          <div className="relative">
            <button
              onClick={() => setNotifsOpen(prev => !prev)}
              title="Real-time operations notifications"
              className={cn(
                'relative rounded-xl border p-2.5 transition',
                notifsOpen ? 'border-cyan/40 bg-cyan/10 text-cyan' : 'border-white/[.08] bg-white/[.03] text-slate-400 hover:text-white'
              )}
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-lg">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifsOpen && (
              <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-white/[.1] bg-[#0c1427] p-4 shadow-2xl backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between border-b border-white/[.07] pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Live Notifications</h3>
                    <span className="rounded-full bg-cyan/15 px-2 py-0.5 text-[10px] font-bold text-cyan">{unreadCount} new</span>
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[11px] font-semibold text-slate-400 hover:text-cyan transition">
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {liveNotifs.map(n => (
                    <button
                      key={n.id}
                      onClick={() => {
                        setReadNotifIds(prev => new Set([...prev, n.id]));
                        setNotifsOpen(false);
                        navigate(`/complaints/${n.complaintId}`);
                      }}
                      className={cn(
                        'flex w-full flex-col gap-1 rounded-xl border p-3 text-left transition',
                        !n.isRead ? 'border-cyan/30 bg-cyan/[.04]' : 'border-white/[.05] bg-white/[.015] hover:bg-white/[.03]'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-white truncate">{n.title}</span>
                        <span className="text-[9px] text-slate-500 shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{n.location} · {n.reporter}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <StatusBadge status={n.status} />
                        <span className="text-[10px] font-semibold text-slate-500">{n.category}</span>
                      </div>
                    </button>
                  ))}
                  {liveNotifs.length === 0 && (
                    <p className="p-6 text-center text-xs text-slate-500">No recent notifications</p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-white/[.07] pt-2 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse" /> Live Realtime Sync</span>
                  <button onClick={() => window.dispatchEvent(new Event('civicfix:refresh'))} className="text-cyan font-bold hover:underline">
                    Refresh feed
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="hidden h-7 w-px bg-white/[.1] sm:block" />
          <button onClick={() => navigate('/profile')} className="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-white/[.04]">
            <span className="hidden text-xs font-semibold text-slate-300 sm:block">{getTimeGreeting()}, {adminFirstName}</span>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-electric text-xs font-bold text-white shadow-md">{adminInitials}</div>
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] p-4 sm:p-8"><Outlet /></main>
    </div>
  </div>;
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div>{eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}<h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p>}</div>{action}</div>;
}
function MetricCard({ label, value, delta, icon: Icon, tone }: { label: string; value: string | number; delta: string; icon: typeof Target; tone: string }) {
  return <div className="glass rounded-2xl p-5"><div className="mb-6 flex items-start justify-between"><div className={cn('grid h-10 w-10 place-items-center rounded-xl', tone)}><Icon size={19} /></div><span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-bold text-emerald-300">{delta}</span></div><p className="text-2xl font-extrabold text-white">{value}</p><p className="mt-1 text-xs font-medium text-slate-500">{label}</p></div>;
}
function Overview() {
  const { complaints, apiRequest } = useApp(); const navigate = useNavigate();
  const [stats, setStats] = useState<{totalComplaints:number;totalUsers:number;byStatus:Record<string,number>} | null>(null);
  useEffect(() => { let active = true; apiRequest('/api/admin/dashboard').then((data:any) => { const byStatus = Array.isArray(data.byStatus) ? Object.fromEntries(data.byStatus.map((x:any) => [x.status, x._count?._all ?? 0])) : (data.byStatus ?? {}); if (active) setStats({ totalComplaints: data.totalComplaints ?? 0, totalUsers: data.totalUsers ?? 0, byStatus }); }).catch(error => console.error('Dashboard load failed:', error)); return () => { active = false; }; }, []);
  const counts = useMemo(() => statusOptions.reduce((acc, status) => ({ ...acc, [status]: complaints.filter(c => c.status === status).length }), {} as Record<string, number>), [complaints]);
  const chartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => { const date = new Date(); date.setDate(date.getDate() - (6 - i)); const dayItems = complaints.filter(c => { const d = new Date(c.createdAt); return !Number.isNaN(d.getTime()) && d.toDateString() === date.toDateString(); }); return { day, submitted: dayItems.length, resolved: dayItems.filter(c => c.status === 'Resolved').length }; });
  return <><PageHeader eyebrow="Operations overview" title="Operations overview" description="Here’s what’s happening across your civic response workspace today." action={<button onClick={() => navigate('/complaints')} className="btn-primary"><Plus size={16} /> View reports</button>} />
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Total complaints" value={stats?.totalComplaints ?? '—'} delta="Live" icon={ClipboardList} tone="bg-electric/10 text-electric" /><MetricCard label="Pending review" value={(stats?.byStatus?.SUBMITTED ?? 0) + (stats?.byStatus?.IN_REVIEW ?? 0)} delta="Live" icon={Clock3} tone="bg-violet-400/10 text-violet-300" /><MetricCard label="In progress" value={(stats?.byStatus?.IN_PROGRESS ?? 0) + (stats?.byStatus?.ASSIGNED ?? 0)} delta="Live" icon={Zap} tone="bg-amber-400/10 text-amber-300" /><MetricCard label="Resolved this month" value={stats?.byStatus?.RESOLVED ?? 0} delta="Live" icon={Check} tone="bg-emerald-400/10 text-emerald-300" /></div>
    <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]"><div className="glass rounded-2xl p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold text-white">Complaint activity</h2><p className="mt-1 text-xs text-slate-500">Complaint activity snapshot</p></div><select className="field w-auto py-2 text-xs"><option>Last 7 days</option><option>Last 30 days</option></select></div><div className="h-64"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="submitted" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00f5d4" stopOpacity={.3} /><stop offset="100%" stopColor="#00f5d4" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#ffffff0b" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} /><Tooltip contentStyle={{ background: '#10172d', border: '1px solid #ffffff15', borderRadius: 12, color: '#fff', fontSize: 12 }} /><Area type="monotone" dataKey="submitted" stroke="#00f5d4" fill="url(#submitted)" strokeWidth={2} /><Area type="monotone" dataKey="resolved" stroke="#8b5cf6" fill="none" strokeWidth={2} /></AreaChart></ResponsiveContainer></div><div className="mt-3 flex gap-5 text-[11px] text-slate-400"><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-cyan" />Submitted</span><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-violet-400" />Resolved</span></div></div>
      <div className="glass rounded-2xl p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold text-white">Priority distribution</h2><p className="mt-1 text-xs text-slate-500">Current open complaints</p></div><span className="text-[10px] text-slate-500">Live complaint priorities</span></div><div className="h-56"><ResponsiveContainer><PieChart><Pie data={[{ name: 'Critical', value: complaints.filter(c => c.priority === 'Critical').length || 1 }, { name: 'High', value: complaints.filter(c => c.priority === 'High').length || 1 }, { name: 'Medium', value: complaints.filter(c => c.priority === 'Medium').length || 1 }, { name: 'Low', value: complaints.filter(c => c.priority === 'Low').length || 1 }]} innerRadius={62} outerRadius={84} paddingAngle={4} dataKey="value"><Cell fill="#fb7185" /><Cell fill="#fb923c" /><Cell fill="#fbbf24" /><Cell fill="#64748b" /></Pie><Tooltip contentStyle={{ background: '#10172d', border: '1px solid #ffffff15', borderRadius: 12, fontSize: 12 }} /></PieChart></ResponsiveContainer></div><div className="grid grid-cols-2 gap-3">{[['Critical', 'bg-rose-400'], ['High', 'bg-orange-400'], ['Medium', 'bg-amber-400'], ['Low', 'bg-slate-500']].map(([label, color]) => <div key={label} className="flex items-center gap-2 text-xs text-slate-400"><i className={cn('h-2 w-2 rounded-full', color)} />{label}<span className="ml-auto font-bold text-white">{complaints.filter(c => c.priority === label).length}</span></div>)}</div></div></div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]"><RecentReports complaints={complaints.slice(0, 4)} /><div className="glass rounded-2xl p-5"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold">AI review queue</h2><p className="mt-1 text-xs text-slate-500">Demo suggestions awaiting action</p></div><Link to="/ai-review" className="text-xs font-bold text-cyan">View queue <ChevronRight className="inline" size={14} /></Link></div><div className="space-y-3">{complaints.slice(0, 3).map(c => <div key={c.id} className="flex items-center gap-3 rounded-xl border border-white/[.06] bg-white/[.025] p-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-violet-400/10 text-violet-300"><Bot size={16} /></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{c.title}</p><p className="mt-1 text-[10px] text-slate-500">{c.aiConfidence}% confidence · {c.aiCategory}</p></div><ChevronRight size={15} className="text-slate-600" /></div>)}</div></div></div>
  </>;
}
function RecentReports({ complaints }: { complaints: Complaint[] }) {
  const navigate = useNavigate();
  return <div className="glass overflow-hidden rounded-2xl"><div className="flex items-center justify-between border-b border-white/[.07] p-5"><div><h2 className="font-bold">Recent complaints</h2><p className="mt-1 text-xs text-slate-500">Latest reports from the citizen app</p></div><Link to="/complaints" className="text-xs font-bold text-cyan">View all <ChevronRight className="inline" size={14} /></Link></div><div className="divide-y divide-white/[.05]">{complaints.map(c => <button key={c.id} onClick={() => navigate(`/complaints/${c.id}`)} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-white/[.03]"><ComplaintImage src={c.image} alt={`${c.title} complaint`} className="h-11 w-11 shrink-0 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{c.title}</p><p className="mt-1 truncate text-[11px] text-slate-500">{c.id} · {c.location}</p></div><StatusBadge status={c.status} /><ChevronRight size={15} className="text-slate-600" /></button>)}</div></div>;
}

function Complaints() {
  const { complaints } = useApp(); const navigate = useNavigate();
  const [search, setSearch] = useState(''); const [status, setStatus] = useState('All'); const [category, setCategory] = useState('All'); const [priority, setPriority] = useState('All');
  const filtered = complaints.filter(c => `${c.id} ${c.title} ${c.location}`.toLowerCase().includes(search.toLowerCase()) && (status === 'All' || c.status === status) && (category === 'All' || c.category === category) && (priority === 'All' || c.priority === priority));
  return <><PageHeader eyebrow="Case management" title="Complaints" description="Search, filter and manage every report submitted through the CivicFix citizen app." action={<button onClick={() => { setSearch(''); setStatus('All'); setCategory('All'); setPriority('All'); }} className="btn-secondary"><Filter size={16} /> Clear filters</button>} /><div className="glass rounded-2xl"><div className="flex flex-col gap-3 border-b border-white/[.07] p-4 lg:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 text-slate-500" size={16} /><input value={search} onChange={e => setSearch(e.target.value)} className="field pl-10" placeholder="Search by ID, title or location..." /></div><select className="field lg:w-44" value={status} onChange={e => setStatus(e.target.value)}><option>All</option>{statusOptions.map(o => <option key={o}>{o}</option>)}</select><select className="field lg:w-44" value={category} onChange={e => setCategory(e.target.value)}><option>All</option>{categoryOptions.map(o => <option key={o}>{o}</option>)}</select><select className="field lg:w-32" value={priority} onChange={e => setPriority(e.target.value)}><option>All</option>{priorityOptions.map(o => <option key={o}>{o}</option>)}</select></div><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead className="bg-white/[.025] text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3 font-bold">Complaint</th><th className="px-4 py-3 font-bold">Category</th><th className="px-4 py-3 font-bold">Priority</th><th className="px-4 py-3 font-bold">Status</th><th className="px-4 py-3 font-bold">Reported</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-white/[.05]">{filtered.map(c => <tr key={c.id} onClick={() => navigate(`/complaints/${c.id}`)} className="cursor-pointer transition hover:bg-white/[.035]"><td className="px-5 py-4"><div className="flex items-center gap-3"><ComplaintImage src={c.image} alt={`${c.title} complaint`} className="h-10 w-10 shrink-0 rounded-lg object-cover" /><div><p className="text-xs font-bold text-white">{c.title}</p><p className="mt-1 text-[10px] text-slate-500">{c.id} · {c.location}</p></div></div></td><td className="px-4 py-4 text-xs text-slate-400">{c.category}</td><td className="px-4 py-4"><PriorityText priority={c.priority} /></td><td className="px-4 py-4"><StatusBadge status={c.status} /></td><td className="px-4 py-4 text-xs text-slate-500">{c.createdAt}</td><td className="px-4 py-4"><MoreHorizontal size={17} className="text-slate-500" /></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="p-12 text-center"><ClipboardList className="mx-auto text-slate-600" /><p className="mt-3 text-sm font-bold">No complaints found</p><p className="mt-1 text-xs text-slate-500">Try changing your search or filters.</p></div>}</div><div className="flex items-center justify-between border-t border-white/[.07] px-5 py-3 text-[11px] text-slate-500"><span>Showing {filtered.length} of {complaints.length} complaints</span><span>Live reports · synced with CivicFix API</span></div></div></>;
}

function UsersPage() {
  const { apiRequest } = useApp();
  const [users, setUsers] = useState<Array<{id:string;name:string;email:string;role:string;createdAt:string;_count?:{complaints:number}}>>([]);
  const [search, setSearch] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const loadUsers = () => {
      apiRequest(`/api/admin/users?q=${encodeURIComponent(search)}&limit=50`).then(data => {
        if(active) setUsers(data.users ?? []);
      }).catch(e => {
        if(active) setError(e instanceof Error ? e.message : 'Unable to load users');
      }).finally(() => {
        if(active) setLoading(false);
      });
    };
    loadUsers();
    const timer = window.setInterval(loadUsers, 5000);
    const onRefresh = () => loadUsers();
    window.addEventListener('civicfix:refresh', onRefresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('civicfix:refresh', onRefresh);
    };
  }, [search]);
  return <><PageHeader eyebrow="People & access" title="Users management" description="Citizen and administrator accounts from the CivicFix database." action={<span className="rounded-full border border-cyan/20 bg-cyan/10 px-3 py-2 text-xs font-bold text-cyan">{users.length} loaded</span>} />
    <div className="glass overflow-hidden rounded-2xl"><div className="border-b border-white/[.07] p-4"><div className="relative max-w-md"><Search className="absolute left-3 top-3 text-slate-500" size={16}/><input className="field pl-10" placeholder="Search name or email..." value={search} onChange={e=>setSearch(e.target.value)}/></div></div>
    {loading && users.length === 0 ? <p className="p-8 text-sm text-slate-400">Loading users...</p> : error && users.length === 0 ? <p className="p-8 text-sm text-rose-300">{error}</p> : users.length===0 ? <p className="p-8 text-sm text-slate-400">No users found.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left"><thead className="bg-white/[.025] text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Complaints</th><th className="px-4 py-3">Joined</th></tr></thead><tbody className="divide-y divide-white/[.05]">{users.map(u=><tr key={u.id}><td className="px-5 py-4"><p className="text-sm font-bold">{u.name}</p><p className="mt-1 text-xs text-slate-500">{u.email}</p></td><td className="px-4 py-4 text-xs text-cyan">{u.role}</td><td className="px-4 py-4 text-xs">{u._count?.complaints ?? 0}</td><td className="px-4 py-4 text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>}</div></>;
}

function ComplaintDetails() {
  const { id } = useParams(); const navigate = useNavigate(); const { complaints, updateComplaint } = useApp(); const complaint = complaints.find(c => c.id === id);
  const [showConfirm, setShowConfirm] = useState(false);
  const [draftStatus, setDraftStatus] = useState<ComplaintStatus | null>(null);
  const [draftPriority, setDraftPriority] = useState<Priority | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  if (!complaint) return <EmptyState title="Complaint not found" action={<Link className="btn-primary" to="/complaints">Back to complaints</Link>} />;
  return <><button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white"><ArrowLeft size={15} /> Back to complaints</button><PageHeader eyebrow={complaint.id} title={complaint.title} description={`Reported by ${complaint.reporter} · ${complaint.createdAt}`} action={<StatusBadge status={complaint.status} />} /><div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]"><div className="space-y-5"><div className="glass overflow-hidden rounded-2xl"><ComplaintImage src={complaint.image} alt={`${complaint.title} complaint`} className="h-72 w-full bg-slate-900 object-contain sm:h-96" /><div className="p-5"><div className="mb-5 flex flex-wrap items-center gap-3"><PriorityText priority={complaint.priority} /><span className="text-xs text-slate-600">•</span><span className="text-xs text-slate-400">{complaint.category}</span><span className="text-xs text-slate-600">•</span><span className="text-xs text-slate-400">{complaint.ward}</span></div><h3 className="mb-2 text-sm font-bold">Description</h3><p className="text-sm leading-6 text-slate-400">{complaint.description}</p></div></div><div className="glass rounded-2xl p-5"><div className="mb-5 flex items-center justify-between"><h3 className="font-bold">Location</h3><button onClick={() => window.open(`https://www.openstreetmap.org/search?query=${encodeURIComponent(complaint.location)}`, '_blank', 'noopener,noreferrer')} className="text-xs font-bold text-cyan">Open in maps <ChevronRight className="inline" size={14} /></button></div><div className="flex h-40 items-center justify-center rounded-xl border border-cyan/10 bg-[radial-gradient(circle_at_center,rgba(0,245,212,.12),transparent_50%),linear-gradient(135deg,#111a31,#0b1226)]"><div className="text-center"><Map className="mx-auto mb-2 text-cyan" size={25} /><p className="text-sm font-bold">{complaint.location}</p><p className="mt-1 text-xs text-slate-500">OpenStreetMap preview · {complaint.ward}</p></div></div></div></div><div className="space-y-5"><div className="glass rounded-2xl p-5"><h3 className="mb-5 font-bold">Manage complaint</h3><label className="mb-2 block text-xs font-bold text-slate-400">Status</label><select value={draftStatus ?? complaint.status} onChange={e => setDraftStatus(e.target.value as ComplaintStatus)} className="field mb-4">{statusOptions.map(o => <option key={o}>{o}</option>)}</select><label className="mb-2 block text-xs font-bold text-slate-400">Priority</label><select value={draftPriority ?? complaint.priority} onChange={e => setDraftPriority(e.target.value as Priority)} className="field mb-5">{priorityOptions.map(o => <option key={o}>{o}</option>)}</select><button disabled={saving || (!draftStatus && !draftPriority)} onClick={async () => { setSaving(true); setSaveError(''); try { await updateComplaint(complaint.id, { ...(draftStatus ? { status: draftStatus } : {}), ...(draftPriority ? { priority: draftPriority } : {}) }); setDraftStatus(null); setDraftPriority(null); setShowConfirm(true); } catch (e) { setSaveError(e instanceof Error ? e.message : 'Unable to save changes'); } finally { setSaving(false); } }} className="btn-primary w-full"><Check size={16} /> {saving ? 'Saving...' : 'Save changes'}</button>{saveError && <p className="mt-3 text-xs text-rose-300">{saveError}</p>}</div><div className="glass rounded-2xl p-5"><div className="mb-5 flex items-center justify-between"><h3 className="font-bold">Status timeline</h3><Clock3 size={16} className="text-slate-500" /></div><div className="space-y-0">{statusOptions.map((item, index) => { const current = statusOptions.indexOf(complaint.status); const done = index <= current; return <div key={item} className="flex gap-3"><div className="flex flex-col items-center"><span className={cn('grid h-6 w-6 place-items-center rounded-full border text-[10px]', done ? 'border-cyan bg-cyan text-navy' : 'border-white/10 text-slate-600')}>{done ? <Check size={13} /> : index + 1}</span>{index < statusOptions.length - 1 && <span className={cn('h-8 w-px', index < current ? 'bg-cyan/60' : 'bg-white/10')} />}</div><div className={cn('pb-5 text-xs font-semibold', done ? 'text-white' : 'text-slate-600')}>{item}<p className="mt-1 text-[10px] font-normal text-slate-500">{done ? index === current ? 'Current stage' : 'Completed' : 'Awaiting action'}</p></div></div>; })}</div></div></div></div>{showConfirm && <ConfirmDialog title="Changes saved" description="Complaint updates were saved to the CivicFix database." onClose={() => setShowConfirm(false)} />}</>;
}

function AIReview() {
  const { complaints, approveAI, updateComplaint, runAIReview } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'All' | 'Pending' | 'Active' | 'Resolved'>('All');
  const [busy, setBusy] = useState(false);
  const [correcting, setCorrecting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const queue = useMemo(() => {
    return complaints.filter(c => {
      if (filterTab === 'All') return true;
      if (filterTab === 'Pending') return c.status === 'Submitted' || c.status === 'Under Review';
      if (filterTab === 'Active') return c.status === 'In Progress' || c.status === 'Assigned';
      if (filterTab === 'Resolved') return c.status === 'Resolved';
      return true;
    });
  }, [complaints, filterTab]);

  useEffect(() => {
    if (!selectedId && queue.length > 0) {
      setSelectedId(queue[0].id);
    } else if (selectedId && !queue.some(c => c.id === selectedId) && queue.length > 0) {
      setSelectedId(queue[0].id);
    }
  }, [queue, selectedId]);

  const selected = complaints.find(c => c.id === selectedId) ?? queue[0] ?? null;
  const action = async (fn: () => Promise<unknown> | void, success: string) => { setBusy(true); setError(''); try { await fn(); setMessage(success); window.setTimeout(() => setMessage(''), 2600); } catch (e) { setError(e instanceof Error ? e.message : 'Action failed'); } finally { setBusy(false); } };
  return <><PageHeader eyebrow="Human-in-the-loop moderation" title="AI Review Center" description="Run AI analysis on citizen reports, review the result, and approve or correct suggestions." /><div className="mb-5 rounded-2xl border border-violet-400/20 bg-violet-400/[.06] p-4 text-xs text-violet-200"><div className="flex gap-3"><Bot className="shrink-0 text-violet-300" size={17} /><p><strong>Human approval required.</strong> AI output is advisory. It does not automatically resolve a civic complaint or represent an official decision.</p></div></div><div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]"><div className="glass rounded-2xl p-4"><div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Review queue</h2><span className="rounded-full bg-cyan/10 px-2 py-1 text-[10px] font-bold text-cyan">{queue.length} reports</span></div><div className="mb-3 flex gap-1 rounded-xl bg-white/[.04] p-1 text-[11px] font-semibold">{(['All', 'Pending', 'Active', 'Resolved'] as const).map(tab => <button key={tab} onClick={() => setFilterTab(tab)} className={cn('flex-1 rounded-lg py-1 transition', filterTab === tab ? 'bg-cyan text-navy font-bold' : 'text-slate-400 hover:text-white')}>{tab}</button>)}</div><div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">{queue.map(c => <button key={c.id} onClick={() => { setSelectedId(c.id); setCorrecting(false); setError(''); }} className={cn('flex w-full items-center gap-3 rounded-xl border p-3 text-left transition', selected?.id === c.id ? 'border-cyan/40 bg-cyan/[.07]' : 'border-white/[.06] hover:bg-white/[.04]')}><ComplaintImage src={c.image} alt={c.title} className="h-12 w-12 rounded-lg object-cover"/><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{c.title}</p><p className="mt-1 text-[10px] text-slate-500">{c.id} · {c.aiConfidence ? `${c.aiConfidence}% confidence` : 'AI not run yet'}</p></div><ChevronRight size={15} className="text-slate-600"/></button>)}</div>{queue.length===0 && <p className="p-8 text-center text-xs text-slate-500">No reports found under this filter.</p>}</div><div className="glass rounded-2xl p-5">{selected ? <><div className="mb-5 flex items-start justify-between"><div><p className="eyebrow mb-2">AI review · {selected.id}</p><h2 className="text-lg font-bold">{selected.title}</h2></div><StatusBadge status={selected.status}/></div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-white/[.07] bg-white/[.025] p-4"><p className="text-[10px] uppercase tracking-wider text-slate-500">Confidence</p><p className="mt-2 text-2xl font-extrabold text-cyan">{selected.aiConfidence ? `${selected.aiConfidence}%` : '—'}</p></div><div className="rounded-xl border border-white/[.07] bg-white/[.025] p-4"><p className="text-[10px] uppercase tracking-wider text-slate-500">AI category</p><p className="mt-2 text-sm font-bold text-white">{selected.aiCategory}</p></div><div className="rounded-xl border border-white/[.07] bg-white/[.025] p-4"><p className="text-[10px] uppercase tracking-wider text-slate-500">Priority</p><p className={cn('mt-2 text-sm font-bold', priorityClass[selected.priority])}>{selected.priority}</p></div></div><div className="my-5 rounded-xl border border-violet-400/15 bg-violet-400/[.05] p-4"><div className="mb-2 flex items-center gap-2 text-xs font-bold text-violet-200"><Sparkles size={14}/> AI summary</div><p className="text-sm leading-6 text-slate-300">{selected.aiSummary}</p></div>{correcting && <div className="mb-4"><label className="mb-2 block text-xs font-bold text-slate-400">Correct category</label><select className="field" value={selected.category} onChange={e => action(() => updateComplaint(selected.id,{category:e.target.value as Category}), 'Category correction saved to database')}>{categoryOptions.map(o=><option key={o}>{o}</option>)}</select></div>}<div className="flex flex-wrap gap-2"><button disabled={busy} onClick={() => action(() => runAIReview(selected.id), 'AI analysis completed and saved')} className="btn-primary"><Sparkles size={16}/> {busy ? 'Working...' : 'Run AI analysis'}</button><button disabled={busy || !selected.aiConfidence} onClick={() => action(() => approveAI(selected.id), 'AI suggestion approved')} className="btn-secondary"><Check size={16}/> Approve suggestion</button><button disabled={busy} onClick={() => setCorrecting(!correcting)} className="btn-secondary"><Pencil size={15}/> Correct category</button><button disabled={busy} onClick={() => action(() => updateComplaint(selected.id,{status:'Under Review'}), 'Report marked for human review')} className="btn-secondary"><CircleHelp size={15}/> Request manual review</button><button disabled={busy} onClick={() => action(() => updateComplaint(selected.id,{priority:selected.priority==='Critical'?'High':'Critical'}), 'Priority updated')} className="btn-secondary"><AlertTriangle size={15}/> Change priority</button></div>{error && <p className="mt-4 rounded-lg border border-rose-400/20 bg-rose-400/10 p-3 text-xs text-rose-200">{error}</p>}</> : <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center"><Bot className="text-slate-600" size={34}/><p className="mt-4 text-sm font-bold">Select a citizen report</p><p className="mt-1 max-w-xs text-xs text-slate-500">Choose a report to run AI analysis and review its actual result.</p></div>}</div></div>{message && <Toast message={message}/>}</>;
}

function StatusManagement() {
  const { complaints, updateComplaint } = useApp(); const grouped = statusOptions.map(status => ({ status, items: complaints.filter(c => c.status === status) }));
  return <><PageHeader eyebrow="Workflow control" title="Status management" description="Move complaints through the response workflow and keep teams aligned." /><div className="grid gap-4 overflow-x-auto pb-2 xl:grid-cols-5">{grouped.map(group => <div key={group.status} className="min-w-[220px] rounded-2xl border border-white/[.07] bg-white/[.025] p-3"><div className="mb-3 flex items-center justify-between px-1"><div className="flex items-center gap-2"><span className={cn('h-2 w-2 rounded-full', group.status === 'Resolved' ? 'bg-emerald-400' : group.status === 'In Progress' ? 'bg-cyan' : group.status === 'Under Review' ? 'bg-violet-400' : 'bg-amber-400')} /><h2 className="text-xs font-bold">{group.status}</h2></div><span className="text-[10px] font-bold text-slate-500">{group.items.length}</span></div><div className="space-y-2">{group.items.map(c => <div key={c.id} className="rounded-xl border border-white/[.07] bg-panel p-3"><div className="mb-3 flex items-start justify-between gap-2"><p className="text-xs font-bold leading-4">{c.title}</p><MoreHorizontal size={14} className="shrink-0 text-slate-600" /></div><p className="mb-3 text-[10px] text-slate-500">{c.id} · {c.ward}</p><div className="flex items-center justify-between"><PriorityText priority={c.priority} /><select aria-label={`Update status for ${c.id}`} value={c.status} onChange={e => updateComplaint(c.id, { status: e.target.value as ComplaintStatus })} className="rounded-lg border border-white/10 bg-white/[.04] px-2 py-1 text-[10px] text-slate-300 outline-none"><option value={c.status}>{c.status}</option>{statusOptions.filter(s => s !== c.status).map(s => <option key={s}>{s}</option>)}</select></div></div>)}</div></div>)}</div></>;
}

function MapView() {
  const { complaints } = useApp(); const navigate = useNavigate(); const [center, setCenter] = useState<[number, number]>([12.9716, 77.5946]);
  const mapPoints = complaints.filter(c => Number.isFinite((c as any).latitude) && Number.isFinite((c as any).longitude));
  return <><PageHeader eyebrow="Geospatial operations" title="Map view" description="Explore citizen reports with available GPS coordinates on OpenStreetMap." action={<button onClick={() => setCenter([12.9716, 77.5946])} className="btn-secondary"><Target size={16} /> Recenter map</button>} /><div className="grid gap-5 xl:grid-cols-[1fr_320px]"><div className="glass overflow-hidden rounded-2xl border-cyan/10 p-1"><MapContainer center={center} zoom={13} scrollWheelZoom className="h-[600px] min-h-[420px] w-full rounded-xl"><RecenterMap center={center} /><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />{mapPoints.map((complaint: any) => { const position: [number, number] = [Number(complaint.latitude), Number(complaint.longitude)]; const resolved = complaint.status === 'Resolved'; return <CircleMarker key={complaint.id} center={position} radius={9} pathOptions={{ color: resolved ? '#34d399' : '#00f5d4', fillColor: resolved ? '#34d399' : '#00f5d4', fillOpacity: .85 }}><Popup><div className="min-w-[180px] text-slate-900"><strong>{complaint.title}</strong><p className="my-1 text-xs">{complaint.location}</p><button className="font-semibold text-blue-700" onClick={() => navigate(`/complaints/${complaint.id}`)}>Open complaint</button></div></Popup></CircleMarker>; })}</MapContainer><p className="px-3 py-2 text-[10px] text-slate-500">Live map tiles from OpenStreetMap. Use a hosted provider or dedicated tile infrastructure for production traffic.</p></div><div className="glass rounded-2xl p-5"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold">Nearby reports</h2><p className="mt-1 text-xs text-slate-500">Select a marker to inspect details</p></div><Map size={17} className="text-cyan" /></div><div className="space-y-3">{complaints.map(c => <button onClick={() => navigate(`/complaints/${c.id}`)} key={c.id} className="flex w-full items-start gap-3 text-left"><div className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-cyan/10 text-cyan"><Map size={13} /></div><div className="min-w-0"><p className="truncate text-xs font-bold">{c.title}</p><p className="mt-1 truncate text-[10px] text-slate-500">{c.location}</p></div></button>)}</div></div></div></>;
}
function RecenterMap({ center }: { center: [number, number] }) { const map = useMap(); useEffect(() => { map.setView(center, 13); }, [center, map]); return null; }

function Analytics() {
  const { complaints } = useApp(); const categories = categoryOptions.map(category => ({ category: category.split(' ')[0], complaints: complaints.filter(c => c.category === category).length, resolved: complaints.filter(c => c.category === category && c.status === 'Resolved').length }));
  const metrics = [{ label: 'Average resolution time', value: '2.4 days', change: '-14.2%', icon: Clock3 }, { label: 'Resolution rate', value: `${complaints.length ? Math.round((complaints.filter(c => c.status === 'Resolved').length / complaints.length) * 100) : 0}%`, change: '+8.4%', icon: Check }, { label: 'AI agreement rate', value: '94.8%', change: '+3.1%', icon: Bot }];
  return <><PageHeader eyebrow="Performance intelligence" title="Analytics" description="Understand service demand and resolution performance from live CivicFix reports." action={<button className="btn-secondary"><span>Nov 01 – Nov 11, 2026</span><ChevronDown size={15} /></button>} /><div className="mb-5 grid gap-4 md:grid-cols-3">{metrics.map(m => <div className="glass rounded-2xl p-5" key={m.label}><div className="mb-5 flex items-center justify-between"><m.icon className="text-cyan" size={18} /><span className="text-[10px] font-bold text-emerald-300">{m.change}</span></div><p className="text-2xl font-extrabold">{m.value}</p><p className="mt-1 text-xs text-slate-500">{m.label}</p></div>)}</div><div className="grid gap-5 xl:grid-cols-2"><div className="glass rounded-2xl p-5"><div className="mb-5"><h2 className="font-bold">Complaints by category</h2><p className="mt-1 text-xs text-slate-500">Current records</p></div><div className="h-72"><ResponsiveContainer><BarChart data={categories} barGap={5}><CartesianGrid stroke="#ffffff0b" vertical={false} /><XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} /><Tooltip contentStyle={{ background: '#10172d', border: '1px solid #ffffff15', borderRadius: 12, fontSize: 12 }} /><Bar dataKey="complaints" fill="#4cc9ff" radius={[4, 4, 0, 0]} /><Bar dataKey="resolved" fill="#00f5d4" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div><div className="glass rounded-2xl p-5"><div className="mb-5"><h2 className="font-bold">Resolution trend</h2><p className="mt-1 text-xs text-slate-500">Based on reports currently loaded</p></div><div className="h-72"><ResponsiveContainer><AreaChart data={['W1', 'W2', 'W3', 'W4'].map((week, i) => { const slice = complaints.slice(Math.floor(complaints.length * i / 4), Math.floor(complaints.length * (i + 1) / 4)); return { week, rate: slice.length ? Math.round(slice.filter(c => c.status === 'Resolved').length / slice.length * 100) : 0, target: 75 }; })}><defs><linearGradient id="rate" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={.3} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#ffffff0b" vertical={false} /><XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} /><Tooltip contentStyle={{ background: '#10172d', border: '1px solid #ffffff15', borderRadius: 12, fontSize: 12 }} /><Area type="monotone" dataKey="rate" stroke="#8b5cf6" fill="url(#rate)" strokeWidth={2} /><Area type="monotone" dataKey="target" stroke="#ffffff33" fill="none" strokeDasharray="4 4" /></AreaChart></ResponsiveContainer></div></div></div></>;
}

function MapPlaceholder() { return null; }
function SettingsPage() {
  const { adminProfile, updateAdminProfile } = useApp();
  const [saved, setSaved] = useState(false); const [section, setSection] = useState('General');
  const [workspace, setWorkspace] = useState(() => localStorage.getItem('civicfix.workspace') || 'CivicFix Operations');
  const [notifications, setNotifications] = useState(true); const [aiReview, setAiReview] = useState(true);
  const save = () => { localStorage.setItem('civicfix.workspace', workspace); setSaved(true); setTimeout(() => setSaved(false), 2500); };
  return <><PageHeader eyebrow="Workspace controls" title="Settings" description="Configure the admin console experience for your operations team." /><div className="grid max-w-4xl gap-5 lg:grid-cols-[220px_1fr]"><div className="space-y-1">{['General', 'Notifications', 'AI preferences', 'Team access'].map(item => <button key={item} onClick={() => setSection(item)} className={cn('w-full rounded-xl px-3 py-2.5 text-left text-xs font-bold', section === item ? 'bg-cyan/10 text-cyan' : 'text-slate-500 hover:bg-white/[.04] hover:text-white')}>{item}</button>)}</div><div className="glass rounded-2xl p-5 sm:p-6"><h2 className="font-bold">{section}</h2><p className="mt-1 text-xs text-slate-500">Changes are stored locally and synced across the workspace.</p>{section === 'General' && <div className="mt-6 space-y-5"><label className="block"><span className="mb-2 block text-xs font-bold text-slate-400">Workspace name</span><input className="field" value={workspace} onChange={e => setWorkspace(e.target.value)} /></label><label className="block"><span className="mb-2 block text-xs font-bold text-slate-400">Default ward</span><select className="field"><option>All wards</option><option>Ward 112</option><option>Ward 113</option></select></label></div>}{section === 'Notifications' && <ToggleRow label="Review notifications" enabled={notifications} onToggle={() => setNotifications(value => !value)} />}{section === 'AI preferences' && <ToggleRow label="Require human review for low confidence" enabled={aiReview} onToggle={() => setAiReview(value => !value)} />}{section === 'Team access' && <div className="mt-6 space-y-3">{[[adminProfile.name, adminProfile.role], ['Priya Shah', 'Reviewer'], ['Rohan Das', 'Field coordinator']].map(([name, role]) => <div key={name} className="flex items-center justify-between rounded-xl border border-white/[.07] bg-white/[.025] p-3"><div><p className="text-xs font-bold text-white">{name}</p><p className="mt-1 text-[10px] text-slate-500">{role}</p></div><Link to="/profile" className="btn-secondary px-3 py-2 text-[10px]"><Pencil size={12} /> Edit profile</Link></div>)}</div>}<button onClick={save} className="btn-primary mt-7">{saved ? <><Check size={15} /> Saved preferences</> : 'Save preferences'}</button></div></div></>;
}
function ToggleRow({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) { return <button onClick={onToggle} className="mt-6 flex w-full items-center justify-between rounded-xl border border-white/[.07] bg-white/[.025] p-4 text-left"><span className="text-xs font-bold">{label}</span><span className={cn('h-5 w-9 rounded-full p-0.5 transition', enabled ? 'bg-cyan' : 'bg-slate-700')}><span className={cn('block h-4 w-4 rounded-full bg-navy transition', enabled && 'translate-x-4')} /></span></button>; }
function Profile() {
  const { adminProfile, updateAdminProfile } = useApp();
  const [name, setName] = useState(adminProfile.name);
  const [email, setEmail] = useState(adminProfile.email);
  const [role, setRole] = useState(adminProfile.role);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(adminProfile.name);
    setEmail(adminProfile.email);
    setRole(adminProfile.role);
  }, [adminProfile]);

  const initials = name.split(' ').filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'AD';

  const update = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await updateAdminProfile({ name, email, role });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return <><PageHeader eyebrow="Account & Identity" title="Admin profile" description="Update administrator credentials, name, and identity across the entire console." /><div className="glass max-w-2xl rounded-2xl p-5 sm:p-7"><div className="mb-7 flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-electric text-xl font-extrabold text-white shadow-lg">{initials}</div><div><h2 className="text-lg font-bold text-white">{name}</h2><p className="mt-1 text-xs text-slate-400">{role} · CivicFix Operations</p></div></div><form onSubmit={update} className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><label><span className="mb-2 block text-xs font-bold text-slate-400">Full name</span><input className="field" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aarav Mehta" required /></label><label><span className="mb-2 block text-xs font-bold text-slate-400">Email address</span><input type="email" className="field" value={email} onChange={e => setEmail(e.target.value)} required /></label></div><label className="block"><span className="mb-2 block text-xs font-bold text-slate-400">Role & Title</span><input className="field" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Super admin" /></label><div className="flex items-center gap-3 pt-2"><button type="submit" disabled={saving} className="btn-primary">{saved ? <><Check size={15} /> Updated globally!</> : saving ? 'Saving...' : 'Update profile everywhere'}</button>{saved && <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5"><Check size={14} /> Reflected in header, sidebar & settings</span>}</div></form></div></>;
}
function Login() { const navigate = useNavigate(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const submit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setError(''); try { const response = await fetch(`${backendUrl.replace(/\/$/, '')}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); if (!response.ok) throw new Error('Backend login failed'); const payload = await response.json() as { token?: string; user?: { role?: string } }; if (!payload.token || payload.user?.role !== 'ADMIN') throw new Error('An administrator account is required'); localStorage.setItem(tokenStorageKey, payload.token); navigate('/'); } catch (loginError) { setError(loginError instanceof Error ? loginError.message : 'Unable to sign in. Check the backend connection and credentials.'); } finally { setLoading(false); } }; return <div className="flex min-h-screen items-center justify-center overflow-hidden bg-navy p-5"><div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-violet-500/[.08] blur-3xl" /><div className="relative w-full max-w-[420px]"><div className="mb-8 flex justify-center"><Logo /></div><div className="glass rounded-3xl p-6 sm:p-8"><div className="mb-7"><p className="eyebrow mb-2">Operations workspace</p><h1 className="text-2xl font-extrabold">Welcome back</h1><p className="mt-2 text-sm text-slate-400">Sign in to review and resolve civic reports.</p></div><form onSubmit={submit} className="space-y-4"><label className="block"><span className="mb-2 block text-xs font-bold text-slate-400">Work email</span><input type="email" required className="field" value={email} onChange={e => setEmail(e.target.value)} /></label><label className="block"><span className="mb-2 block text-xs font-bold text-slate-400">Password</span><input type="password" required className="field" value={password} onChange={e => setPassword(e.target.value)} /></label><div className="flex items-center justify-between text-xs"><label className="flex items-center gap-2 text-slate-500"><input type="checkbox" defaultChecked className="accent-cyan" /> Remember me</label><span className="font-bold text-slate-600" title="Ask the system administrator to reset the account password">Password reset: contact admin</span></div>{error && <p className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-xs leading-5 text-amber-200">{error}</p>}<button disabled={loading} className="btn-primary mt-2 w-full">{loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-navy/30 border-t-navy" /> Signing in...</> : <>Sign in to dashboard <ChevronRight size={16} /></>}</button></form><div className="mt-6 rounded-xl border border-violet-400/15 bg-violet-400/[.05] p-3 text-center text-[10px] text-violet-200"><span className="ml-1">Secure administrator sign-in · connected to CivicFix API</span></div></div><p className="mt-6 text-center text-[10px] text-slate-600">CivicFix AI · Prototype console</p></div></div>; }
function EmptyState({ title, action }: { title: string; action?: ReactNode }) { return <div className="glass rounded-2xl p-16 text-center"><CircleHelp className="mx-auto text-slate-600" size={32} /><h2 className="mt-4 font-bold">{title}</h2><div className="mt-5">{action}</div></div>; }
function ConfirmDialog({ title, description, onClose }: { title: string; description: string; onClose: () => void }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-navy/80 p-5 backdrop-blur-sm"><div className="glass w-full max-w-sm rounded-2xl p-6"><div className="mb-4 flex items-start justify-between"><div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300"><Check size={19} /></div><button onClick={onClose} className="text-slate-500 hover:text-white"><X size={17} /></button></div><h2 className="font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{description}</p><button onClick={onClose} className="btn-primary mt-5 w-full">Done</button></div></div>; }
function Toast({ message }: { message: string }) { return <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-xl border border-cyan/20 bg-panel px-4 py-3 text-xs font-bold text-cyan shadow-xl"><Check size={15} />{message}</div>; }

export default function App() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(() => {
    const savedName = localStorage.getItem('civicfix.adminName') || 'Aarav Mehta';
    const savedEmail = localStorage.getItem('civicfix.adminEmail') || 'aarav@civicfix.demo';
    const savedRole = localStorage.getItem('civicfix.adminRole') || 'Super admin';
    return { name: savedName, email: savedEmail, role: savedRole };
  });

  const apiRequest = async (path: string, init: RequestInit = {}) => {
    const token = localStorage.getItem(tokenStorageKey);
    if (!token) throw new Error('Session expired. Please sign in again.');
    const response = await fetch(`${backendUrl.replace(/\/$/, '')}${path}`, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(init.headers || {}) } });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403) { localStorage.removeItem(tokenStorageKey); window.location.assign('/login'); throw new Error('Your admin session has expired.'); }
    if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
    return payload;
  };

  const updateAdminProfile = async (patch: Partial<AdminProfile>) => {
    setAdminProfile(prev => {
      const updated = { ...prev, ...patch };
      if (patch.name) localStorage.setItem('civicfix.adminName', patch.name);
      if (patch.email) localStorage.setItem('civicfix.adminEmail', patch.email);
      if (patch.role) localStorage.setItem('civicfix.adminRole', patch.role);
      return updated;
    });

    try {
      if (localStorage.getItem(tokenStorageKey)) {
        await apiRequest('/api/admin/profile', {
          method: 'PATCH',
          body: JSON.stringify({ name: patch.name, email: patch.email }),
        });
      }
    } catch (err) {
      console.warn('Backend profile update note:', err);
    }
  };

  const refreshComplaints = async () => { const data = await apiRequest('/api/complaints'); if (Array.isArray(data)) setComplaints(data.map((item: Record<string, unknown>) => normalizeComplaint(item)).filter((item: Complaint | null): item is Complaint => item !== null)); };
  useEffect(() => {
    if (!localStorage.getItem(tokenStorageKey)) return;
    let active = true;
    const load = () => {
      refreshComplaints().catch(error => console.error('Complaint loading failed:', error));
      apiRequest('/api/admin/profile').then((prof: any) => {
        if (prof?.name && active) {
          setAdminProfile(prev => ({
            ...prev,
            name: prof.name,
            email: prof.email || prev.email,
          }));
          localStorage.setItem('civicfix.adminName', prof.name);
          if (prof.email) localStorage.setItem('civicfix.adminEmail', prof.email);
        }
      }).catch(() => {});
    };
    load();
    const timer = window.setInterval(() => { if (active) load(); }, 10000);
    const onRefresh = () => load();
    window.addEventListener('civicfix:refresh', onRefresh);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener('civicfix:refresh', onRefresh); };
  }, []);
  const updateComplaint = async (id: string, patch: Partial<Complaint>) => {
    const current = complaints.find(c => c.id === id); if (!current) return;
    if (patch.status && patch.status !== current.status) await apiRequest(`/api/admin/complaints/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: ({ 'Submitted':'SUBMITTED', 'Under Review':'IN_REVIEW', 'Assigned':'ASSIGNED', 'In Progress':'IN_PROGRESS', 'Resolved':'RESOLVED' } as Record<string,string>)[patch.status] }) });
    if (patch.category || patch.priority) await apiRequest(`/api/admin/complaints/${id}/correction`, { method: 'PATCH', body: JSON.stringify({ ...(patch.category ? { category: patch.category } : {}), ...(patch.priority ? { priority: patch.priority === 'Critical' ? 'URGENT' : patch.priority.toUpperCase() } : {}) }) });
    await refreshComplaints();
  };
  const approveAI = async (id: string) => { await apiRequest(`/api/admin/complaints/${id}/ai-approve`, { method: 'POST', body: JSON.stringify({ note: 'Reviewed in CivicFix Admin Panel' }) }); await refreshComplaints(); };
  const runAIReview = async (id: string) => { const result = await apiRequest(`/api/admin/complaints/${id}/ai-review`, { method: 'POST', body: JSON.stringify({}) }); await refreshComplaints(); return result; };
  const value = { complaints, updateComplaint, approveAI, runAIReview, refreshComplaints, apiRequest, adminProfile, updateAdminProfile };
  return <AppContext.Provider value={value}><Routes><Route path="/login" element={<Login />} /><Route element={<Shell />}><Route index element={<Overview />} /><Route path="complaints" element={<Complaints />} /><Route path="complaints/:id" element={<ComplaintDetails />} /><Route path="users" element={<UsersPage />} /><Route path="ai-review" element={<AIReview />} /><Route path="status" element={<StatusManagement />} /><Route path="map" element={<MapView />} /><Route path="analytics" element={<Analytics />} /><Route path="settings" element={<SettingsPage />} /><Route path="profile" element={<Profile />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes></AppContext.Provider>;
}
