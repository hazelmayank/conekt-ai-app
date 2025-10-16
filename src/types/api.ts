import { API_BASE_URL } from '@env';

// API Configuration
export const API_CONFIG = {
  BASE_URL: API_BASE_URL || 'https://conekt-v2-backend.onrender.com',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
  // Development mode - set to false to use live backend
  USE_MOCK_DATA: false,
};

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginationResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Authentication Types
export interface User {
  id: string;
  phone: string;
  name: string;
  role: string;
  isDemo?: boolean;
}

export interface AuthResponse {
  ok: boolean;
  token?: string;
  user?: User;
  message?: string;
  data?: {
    sid: string;
    status: string;
    dev: boolean;
  };
}

// City Types
export interface City {
  _id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  timezone: string;
}

// Truck Types
export interface TruckRoute {
  route_name: string;
  polyline: Array<{ lat: number; lng: number }>;
  polygon: Array<{ lat: number; lng: number }>;
}

export interface TruckTelemetry {
  uptime: number;
  cpu_usage: number;
  memory_usage: number;
  disk_free: number;
  network_rssi: number;
  temperature: number;
  last_updated: string | null;
}

export interface PlayerStatus {
  status: 'stopped' | 'playing' | 'paused';
  current_item: string | null;
  position_sec: number;
  playlist_version: string | null;
}

export interface Truck {
  _id: string;
  city_id: City;
  truck_number: string;
  route: TruckRoute;
  controller_id: string;
  status: 'online' | 'offline';
  isOnline?: boolean;
  last_heartbeat_at?: string;
  last_sync_at?: string;
  gps_lat: number;
  gps_lng: number;
  storage_mb: number;
  battery_percent: number;
  telemetry?: TruckTelemetry;
  player_status?: PlayerStatus;
  error_logs?: Array<{
    level: string;
    message: string;
    time: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Campaign Types
export interface Campaign {
  _id: string;
  truck_id: string;
  campaign_name: string;
  company_name: string;
  video_url: string;
  video_id: Video;
  start_date: string;
  end_date: string;
  package_type: 'half_month' | 'full_month';
  play_order: number;
  status: 'active' | 'expired' | 'pending';
  booking_cycle: {
    cycle_number: number;
    month: number;
    year: number;
  };
  created_by: string;
  createdAt: string;
  updatedAt: string;
}

// Video Types
export interface Video {
  _id: string;
  video_url: string;
  filename: string;
  duration_sec: number;
  file_size_mb: number;
  cloudinary_public_id?: string;
  checksum?: string;
  resolution: {
    width: number;
    height: number;
  };
  format: string;
  bitrate?: number;
  createdAt: string;
  updatedAt: string;
}

// Playlist Types
export interface PlaylistItem {
  id: string;
  type: 'video';
  url: string;
  checksum: string;
  duration: number;
  loop: boolean;
  play_order: number;
}

export interface Playlist {
  truck_id: string;
  date: string;
  campaigns: Array<{
    _id: string;
    campaign_name: string;
    company_name: string;
    video_url: string;
    play_order: number;
    duration_sec: number;
  }>;
  version: string;
  push_status: 'pending' | 'pushed' | 'failed';
}

// Dashboard Types
export interface DashboardStats {
  overview: {
    totalTrucks: number;
    onlineTrucks: number;
    offlineTrucks: number;
    totalCampaigns: number;
    activeCampaigns: number;
    expiredCampaigns: number;
    totalVideos: number;
    totalStorageUsed: string;
  };
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: string;
  }>;
  systemHealth: {
    database: string;
    cloudinary: string;
    twilio: string;
  };
}
