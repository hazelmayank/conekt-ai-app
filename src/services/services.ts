import { apiService } from './apiService';
import { ApiResponse, City, Truck, Campaign, Video, Playlist, DashboardStats } from '../types/api';
import { API_CONFIG } from '../types/api';
import { citiesCache, trucksCache, campaignsCache, videosCache, generalCache } from './cacheService';

class CitiesService {
  async getAllCities(): Promise<City[]> {
    const cacheKey = 'all-cities';
    
    // Check cache first
    const cached = citiesCache.get<City[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await apiService.request<{success: boolean, data: City[]}>('/admin/cities');
    const data = (response as any).data || [];
    citiesCache.set(cacheKey, data);
    return data;
  }
}

class TrucksService {
  async createTruck(truckData: {
    city_id: string;
    truck_number: string;
    route: {
      route_name: string;
      polyline: Array<{ lat: number; lng: number }>;
      polygon: Array<{ lat: number; lng: number }>;
    };
    gps_lat: number;
    gps_lng: number;
  }): Promise<Truck> {
    const response = await apiService.request<{success: boolean, message: string, data: Truck}>('/admin/trucks', {
      method: 'POST',
      body: JSON.stringify(truckData),
    });
    return (response as any).data!;
  }

  async getTrucksInCity(cityId: string): Promise<Truck[]> {
    const cacheKey = `trucks-city-${cityId}`;
    
    // Check cache first
    const cached = trucksCache.get<Truck[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await apiService.request<{success: boolean, data: Truck[]}>(`/admin/cities/${cityId}/trucks`);
    const data = (response as any).data || [];
    trucksCache.set(cacheKey, data);
    return data;
  }

  async getTruckDetails(truckId: string): Promise<Truck> {
    const response = await apiService.request<Truck>(`/admin/trucks/${truckId}`);
    return (response as any).data!;
  }

  async getTruckPlaylist(truckId: string, date: string): Promise<Playlist> {
    const response = await apiService.request<Playlist>(`/admin/trucks/${truckId}/playlist?date=${date}`);
    return (response as any).data!;
  }

  async getTruckCalendar(truckId: string, startDate: string, endDate: string): Promise<{
    truck_id: string;
    period: {
      start_date: string;
      end_date: string;
    };
    campaigns: Campaign[];
  }> {
    const cacheKey = `truck-calendar-${truckId}-${startDate}-${endDate}`;
    
    // Check cache first
    const cached = campaignsCache.get<{
      truck_id: string;
      period: {
        start_date: string;
        end_date: string;
      };
      campaigns: Campaign[];
    }>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await apiService.request(`/admin/trucks/${truckId}/calendar?start_date=${startDate}&end_date=${endDate}`);
    const data = (response as any).data!;
    campaignsCache.set(cacheKey, data);
    return data;
  }

  async reorderCampaigns(truckId: string, campaigns: Array<{ campaign_id: string; play_order: number }>): Promise<void> {
    await apiService.request(`/admin/trucks/${truckId}/reorder`, {
      method: 'POST',
      body: JSON.stringify({ campaigns }),
    });
    
    // Invalidate truck calendar cache after reordering
    this.invalidateTruckCalendarCache(truckId);
  }

  private invalidateTruckCalendarCache(truckId: string): void {
    // Get all cache keys and remove those related to this truck's calendar
    const stats = campaignsCache.getStats();
    const keysToDelete = stats.keys.filter(key => key.includes(`truck-calendar-${truckId}`));
    
    keysToDelete.forEach(key => {
      campaignsCache.delete(key);
    });
    
    if (keysToDelete.length > 0) {
      console.log(`🗑️ Invalidated ${keysToDelete.length} truck calendar cache entries for truck ${truckId}`);
    }
  }

  async pushPlaylist(truckId: string, date: string): Promise<{
    playlistId: string;
    version: string;
    campaignCount: number;
    pushStatus: string;
  }> {
    const response = await apiService.request(`/admin/trucks/${truckId}/push`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
    return (response as any).data!;
  }
}

class CampaignsService {
  async createCampaign(campaignData: {
    campaign_name: string;
    company_name: string;
    truck_id: string;
    video_id: string;
    package_type: 'half_month' | 'full_month';
    start_date: string;
    play_order: number;
  }): Promise<Campaign> {
    const response = await apiService.request<Campaign>('/admin/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
    
    // Invalidate truck calendar cache for this truck to ensure fresh data
    this.invalidateTruckCalendarCache(campaignData.truck_id);
    
    return (response as any).data!;
  }

  private invalidateTruckCalendarCache(truckId: string): void {
    // Get all cache keys and remove those related to this truck's calendar
    const stats = campaignsCache.getStats();
    const keysToDelete = stats.keys.filter(key => key.includes(`truck-calendar-${truckId}`));
    
    keysToDelete.forEach(key => {
      campaignsCache.delete(key);
    });
    
    if (keysToDelete.length > 0) {
      console.log(`🗑️ Invalidated ${keysToDelete.length} truck calendar cache entries for truck ${truckId}`);
    }
  }

  async removeCampaign(campaignId: string): Promise<void> {
    await apiService.request(`/admin/campaigns/${campaignId}`, {
      method: 'DELETE',
    });
    
    // Note: We can't invalidate by truck ID here since we don't have it
    // The cache will expire naturally, or we could clear all campaign cache
    campaignsCache.clear();
    console.log('🗑️ Cleared all campaign cache after campaign removal');
  }

  async updateCampaign(campaignId: string, updateData: { play_order?: number; campaign_name?: string; company_name?: string }): Promise<any> {
    const response = await apiService.request(`/admin/campaigns/${campaignId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    
    // Note: We can't invalidate by truck ID here since we don't have it
    // The cache will expire naturally, or we could clear all campaign cache
    campaignsCache.clear();
    console.log('🗑️ Cleared all campaign cache after campaign update');
    
    return (response as any).data!;
  }
}

class VideosService {
  private invalidateVideosCache(): void {
    videosCache.clear();
    console.log('🗑️ Invalidated videos cache');
  }

  async uploadVideo(videoFile: any): Promise<{
    _id: string;
    video_url: string;
    filename: string;
    duration_sec: number;
    file_size_mb: number;
    cloudinary_public_id?: string;
    checksum?: string;
    format: string;
    bitrate?: number;
    resolution: { width: number; height: number };
  }> {
    const formData = new FormData();
    
    // Add video file (required)
    formData.append('video', {
      uri: videoFile.uri,
      type: videoFile.type || 'video/mp4',
      name: videoFile.name || 'video.mp4',
    } as any);
    
    // Add filename (optional) - only if provided
    if (videoFile.name) {
      formData.append('filename', videoFile.name);
    }

    const response = await apiService.request('/admin/video-assets', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    
    // Debug: Log the full response structure
    console.log('API Response:', response);
    console.log('Response data:', (response as any).data);
    
    // Clear videos cache to ensure fresh data on next load
    this.invalidateVideosCache();
    
    // Return the data object from the response
    return (response as any).data!;
  }

  async getUploadSignature(filename: string, folder: string = 'conekt/videos'): Promise<{
    signature: string;
    timestamp: number;
    public_id: string;
    folder: string;
  }> {
    const response = await apiService.request('/admin/uploads/presign', {
      method: 'POST',
      body: JSON.stringify({ filename, folder }),
    });
    return (response as any).data!;
  }

  async saveVideoMetadata(videoData: {
    video_url: string;
    filename: string;
    duration_sec: number;
    file_size_mb: number;
    cloudinary_public_id: string;
    resolution: { width: number; height: number };
    format: string;
    bitrate: number;
  }): Promise<Video> {
    const response = await apiService.request<Video>('/admin/videos', {
      method: 'POST',
      body: JSON.stringify(videoData),
    });
    return (response as any).data!;
  }

  async getAllVideos(page: number = 1, limit: number = 20, search?: string, bypassCache: boolean = false): Promise<{
    videos: Video[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalVideos: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const cacheKey = `videos-${page}-${limit}-${search || 'no-search'}`;
    
    // Check cache first (unless bypassing)
    if (!bypassCache) {
      const cached = videosCache.get<{
        videos: Video[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalVideos: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      }>(cacheKey);
      if (cached) {
        console.log('📦 Using cached videos data');
        return cached;
      }
    } else {
      console.log('🔄 Bypassing cache for fresh data');
    }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }

    const response = await apiService.request(`/admin/videos?${params}`);
    const data = (response as any).data!;
    videosCache.set(cacheKey, data);
    return data;
  }

  async deleteVideo(videoId: string): Promise<void> {
    await apiService.request(`/admin/videos/${videoId}`, {
      method: 'DELETE',
    });
    
    // Clear videos cache to ensure fresh data on next load
    this.invalidateVideosCache();
  }
}

class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiService.request<DashboardStats>('/admin/dashboard');
    return (response as any).data!;
  }

  async getSystemHealth(): Promise<{
    status: string;
    timestamp: string;
    services: {
      database: string;
      cloudinary: string;
      twilio: string;
    };
    uptime: number;
  }> {
    const response = await apiService.request('/admin/health');
    return (response as any).data!;
  }
}

// Export service instances
export const citiesService = new CitiesService();
export const trucksService = new TrucksService();
export const campaignsService = new CampaignsService();
export const videosService = new VideosService();
export const dashboardService = new DashboardService();
