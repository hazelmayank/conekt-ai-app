import { apiService } from '../services/apiService';
import { citiesService, trucksService, campaignsService, videosService } from '../services/services';

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  success: boolean;
  error?: string;
  timestamp: string;
}

class PerformanceTester {
  private metrics: PerformanceMetrics[] = [];

  async testEndpoint(
    name: string,
    method: string,
    testFunction: () => Promise<any>
  ): Promise<PerformanceMetrics> {
    const startTime = performance.now();
    const timestamp = new Date().toISOString();
    
    try {
      await testFunction();
      const responseTime = performance.now() - startTime;
      
      const metric: PerformanceMetrics = {
        endpoint: name,
        method,
        responseTime,
        success: true,
        timestamp
      };
      
      this.metrics.push(metric);
      console.log(`✅ ${name}: ${responseTime.toFixed(2)}ms`);
      return metric;
    } catch (error) {
      const responseTime = performance.now() - startTime;
      
      const metric: PerformanceMetrics = {
        endpoint: name,
        method,
        responseTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp
      };
      
      this.metrics.push(metric);
      console.log(`❌ ${name}: ${responseTime.toFixed(2)}ms - ${metric.error}`);
      return metric;
    }
  }

  async runFullPerformanceTest(): Promise<PerformanceMetrics[]> {
    console.log('🚀 Starting Performance Test...');
    console.log('=====================================');
    
    // Test authentication endpoints
    await this.testEndpoint('Health Check', 'GET', async () => {
      await apiService.request('/');
    });
    
    await this.testEndpoint('Send OTP', 'POST', async () => {
      await apiService.sendLoginOTP('+919876543210');
    });
    
    // Test cities endpoint
    await this.testEndpoint('Get Cities', 'GET', async () => {
      await citiesService.getAllCities();
    });
    
    // Test trucks endpoints (assuming we have cities)
    try {
      const cities = await citiesService.getAllCities();
      if (cities.length > 0) {
        await this.testEndpoint('Get Trucks in City', 'GET', async () => {
          await trucksService.getTrucksInCity(cities[0]._id);
        });
        
        // Test truck calendar (assuming we have trucks)
        const trucks = await trucksService.getTrucksInCity(cities[0]._id);
        if (trucks.length > 0) {
          const currentDate = new Date();
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth() + 1;
          const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
          const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
          
          await this.testEndpoint('Get Truck Calendar', 'GET', async () => {
            await trucksService.getTruckCalendar(trucks[0]._id, startDate, endDate);
          });
        }
      }
    } catch (error) {
      console.log('⚠️ Skipping truck tests due to missing data');
    }
    
    // Test videos endpoint
    await this.testEndpoint('Get Videos', 'GET', async () => {
      await videosService.getAllVideos(1, 10);
    });
    
    console.log('=====================================');
    this.printSummary();
    
    return this.metrics;
  }

  printSummary(): void {
    const successful = this.metrics.filter(m => m.success);
    const failed = this.metrics.filter(m => !m.success);
    
    console.log(`📊 Performance Summary:`);
    console.log(`   Total Tests: ${this.metrics.length}`);
    console.log(`   Successful: ${successful.length}`);
    console.log(`   Failed: ${failed.length}`);
    
    if (successful.length > 0) {
      const avgResponseTime = successful.reduce((sum, m) => sum + m.responseTime, 0) / successful.length;
      const slowest = successful.reduce((max, m) => m.responseTime > max.responseTime ? m : max);
      const fastest = successful.reduce((min, m) => m.responseTime < min.responseTime ? m : min);
      
      console.log(`   Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`   Slowest: ${slowest.endpoint} (${slowest.responseTime.toFixed(2)}ms)`);
      console.log(`   Fastest: ${fastest.endpoint} (${fastest.responseTime.toFixed(2)}ms)`);
    }
    
    if (failed.length > 0) {
      console.log(`   Failed Endpoints:`);
      failed.forEach(f => {
        console.log(`     - ${f.endpoint}: ${f.error}`);
      });
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

export const performanceTester = new PerformanceTester();

// Convenience function to run performance test
export const runPerformanceTest = () => {
  return performanceTester.runFullPerformanceTest();
};
