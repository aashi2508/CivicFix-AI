import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import {
  Activity, AlertCircle, AlertTriangle, ArrowLeft, ArrowRight, Bell, Camera, Check, ChevronRight,
  CircleUserRound, Clock3, Eye, EyeOff, Filter, Gauge,
  FileText, Home, Image as ImageIcon, Lightbulb, List, LogOut, Map, MapPin, Menu,
  MessagesSquare, Plus, PlusCircle, RefreshCw, Search, Settings, Share2, Shield,
  ShieldCheck, Sparkles, ThumbsUp, Trash2, UserRound, Users, Waves, X, Zap,
  type LucideIcon,
} from 'lucide-react-native';
import { colors } from '../../theme';

export type IconName =
  | 'home' | 'map' | 'plus' | 'list' | 'user' | 'bell' | 'camera' | 'image'
  | 'location' | 'search' | 'check' | 'alert' | 'clock' | 'sparkles'
  | 'arrow-right' | 'arrow-left' | 'close' | 'filter' | 'shield' | 'eye'
  | 'eye-off' | 'thumb-up' | 'share' | 'road' | 'light' | 'trash' | 'water'
  | 'settings' | 'log-out' | 'refresh' | 'chevron-right' | 'menu' | 'zap'
  | 'file-text' | 'alert-circle' | 'users' | 'map-pin' | 'shield-check'
  | 'activity' | 'messages-square' | 'user-round' | 'plus-circle';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

const ICON_MAP: Record<IconName, LucideIcon> = {
  home: Home,
  map: Map,
  plus: Plus,
  list: List,
  user: UserRound,
  bell: Bell,
  camera: Camera,
  image: ImageIcon,
  location: MapPin,
  search: Search,
  check: Check,
  alert: AlertTriangle,
  clock: Clock3,
  sparkles: Sparkles,
  'arrow-right': ArrowRight,
  'arrow-left': ArrowLeft,
  close: X,
  filter: Filter,
  shield: Shield,
  eye: Eye,
  'eye-off': EyeOff,
  'thumb-up': ThumbsUp,
  share: Share2,
  road: Gauge,
  light: Lightbulb,
  trash: Trash2,
  water: Waves,
  settings: Settings,
  'log-out': LogOut,
  refresh: RefreshCw,
  'chevron-right': ChevronRight,
  menu: Menu,
  zap: Zap,
  'file-text': FileText,
  'alert-circle': AlertCircle,
  users: Users,
  'map-pin': MapPin,
  'shield-check': ShieldCheck,
  activity: Activity,
  'messages-square': MessagesSquare,
  'user-round': UserRound,
  'plus-circle': PlusCircle,
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color = colors.cyan,
  style,
}) => {
  const IconComponent = ICON_MAP[name] ?? CircleUserRound;
  return (
    <View style={[styles.container, style]}>
      <IconComponent size={size} color={color} strokeWidth={2.2} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
