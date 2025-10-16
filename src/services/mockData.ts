import { City, Truck, Campaign, Video, DashboardStats, User } from '../types/api';

// Mock data for development when backend is not available
export const mockData = {
  cities: [
    {
      _id: '1',
      name: 'Mumbai',
      coordinates: { lat: 19.0760, lng: 72.8777 },
      timezone: 'Asia/Kolkata'
    },
    {
      _id: '2',
      name: 'Delhi',
      coordinates: { lat: 28.7041, lng: 77.1025 },
      timezone: 'Asia/Kolkata'
    },
    {
      _id: '3',
      name: 'Bangalore',
      coordinates: { lat: 12.9716, lng: 77.5946 },
      timezone: 'Asia/Kolkata'
    }
  ] as City[],

  trucks: [
    {
      _id: '1',
      city_id: {
        _id: '1',
        name: 'Mumbai',
        coordinates: { lat: 19.0760, lng: 72.8777 },
        timezone: 'Asia/Kolkata'
      },
      truck_number: 'KA 25 AA 7007',
      route: {
        route_name: 'Indranagar Route',
        polyline: [
          { lat: 19.0760, lng: 72.8777 },
          { lat: 19.0761, lng: 72.8778 },
          { lat: 19.0762, lng: 72.8779 }
        ],
        polygon: [
          { lat: 19.0750, lng: 72.8760 },
          { lat: 19.0770, lng: 72.8760 },
          { lat: 19.0770, lng: 72.8790 },
          { lat: 19.0750, lng: 72.8790 }
        ]
      },
      controller_id: 'TRUCK_KA25_AA_7007',
      status: 'online' as const,
      isOnline: true,
      last_heartbeat_at: new Date().toISOString(),
      gps_lat: 19.0760,
      gps_lng: 72.8777,
      storage_mb: 1500,
      battery_percent: 85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '2',
      city_id: {
        _id: '1',
        name: 'Mumbai',
        coordinates: { lat: 19.0760, lng: 72.8777 },
        timezone: 'Asia/Kolkata'
      },
      truck_number: 'KA 25 BB 8008',
      route: {
        route_name: 'Marine Drive Route',
        polyline: [
          { lat: 19.0760, lng: 72.8777 },
          { lat: 19.0761, lng: 72.8778 }
        ],
        polygon: [
          { lat: 19.0750, lng: 72.8760 },
          { lat: 19.0770, lng: 72.8760 },
          { lat: 19.0770, lng: 72.8790 },
          { lat: 19.0750, lng: 72.8790 }
        ]
      },
      controller_id: 'TRUCK_KA25_BB_8008',
      status: 'offline' as const,
      isOnline: false,
      last_heartbeat_at: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      gps_lat: 19.0760,
      gps_lng: 72.8777,
      storage_mb: 800,
      battery_percent: 45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ] as Truck[],

  campaigns: [
    {
      _id: '1',
      truck_id: '1',
      campaign_name: 'Summer Sale 2025',
      company_name: 'ABC Company',
      video_url: 'https://example.com/video1.mp4',
      video_id: {
        _id: '1',
        video_url: 'https://example.com/video1.mp4',
        filename: 'summer_sale.mp4',
        duration_sec: 30,
        file_size_mb: 5.2,
        resolution: { width: 1920, height: 1080 },
        format: 'mp4',
        bitrate: 2000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      start_date: '2025-01-01T00:00:00.000Z',
      end_date: '2025-01-15T00:00:00.000Z',
      package_type: 'half_month' as const,
      play_order: 1,
      status: 'active' as const,
      booking_cycle: {
        cycle_number: 1,
        month: 1,
        year: 2025
      },
      created_by: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ] as Campaign[],

  videos: [
    {
      _id: '1',
      video_url: 'https://example.com/video1.mp4',
      filename: 'summer_sale.mp4',
      duration_sec: 30,
      file_size_mb: 5.2,
      resolution: { width: 1920, height: 1080 },
      format: 'mp4',
      bitrate: 2000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ] as Video[],

  dashboardStats: {
    overview: {
      totalTrucks: 25,
      onlineTrucks: 20,
      offlineTrucks: 5,
      totalCampaigns: 150,
      activeCampaigns: 120,
      expiredCampaigns: 30,
      totalVideos: 500,
      totalStorageUsed: '2.5 GB'
    },
    recentActivity: [
      {
        type: 'campaign_created',
        message: 'New campaign \'Summer Sale\' created',
        timestamp: new Date().toISOString()
      }
    ],
    systemHealth: {
      database: 'connected',
      cloudinary: 'connected',
      twilio: 'connected'
    }
  } as DashboardStats,

  user: {
    id: '1',
    phone: '+919876543210',
    name: 'Nitin',
    role: 'admin'
  } as User
};

// Mock API responses
export const mockResponses = {
  sendLoginOTP: () => ({
    ok: true,
    message: 'OTP sent for login',
    data: {
      sid: 'VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      status: 'pending',
      dev: true
    }
  }),

  verifyLoginOTP: () => ({
    ok: true,
    token: 'mock_jwt_token_12345',
    user: mockData.user
  }),

  createAdmin: () => ({
    ok: true,
    message: 'Admin user created. OTP sent for verification.',
    data: {
      sid: 'VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      status: 'pending',
      dev: true
    }
  }),

  verifyAdminAccount: () => ({
    ok: true,
    message: 'Account verified successfully',
    token: 'mock_jwt_token_12345',
    user: mockData.user
  }),

  getAllCities: () => ({
    success: true,
    data: mockData.cities
  }),

  getTrucksInCity: (cityId: string) => ({
    success: true,
    data: mockData.trucks.filter(truck => truck.city_id._id === cityId)
  }),

  createTruck: (truckData: any) => ({
    success: true,
    message: 'Truck created successfully',
    data: {
      _id: Math.random().toString(36).substr(2, 9),
      ...truckData,
      controller_id: `TRUCK_${truckData.truck_number.replace(/[^A-Z0-9]/g, '_')}`,
      status: 'offline',
      storage_mb: 0,
      battery_percent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }),

  getDashboardStats: () => ({
    success: true,
    data: mockData.dashboardStats
  })
};
