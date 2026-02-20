import { services } from '../config/services.js';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  error?: string;
}

/**
 * Check health of all registered services
 */
export async function checkServiceHealth(): Promise<ServiceHealth[]> {
  const healthChecks = Object.entries(services).map(async ([_key, config]): Promise<ServiceHealth> => {
    const startTime = Date.now();
    let timeoutId: NodeJS.Timeout | undefined;
    
    try {
      const healthPath = config.healthCheckPath || '/health';
      const url = `${config.baseUrl}${healthPath}`;
      
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), config.timeout || 5000);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return {
          name: config.name,
          status: 'healthy',
          responseTime,
        };
      } else {
        return {
          name: config.name,
          status: 'unhealthy',
          responseTime,
          error: `HTTP ${response.status}`,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        name: config.name,
        status: 'unhealthy',
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  });

  return Promise.all(healthChecks);
}
