import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom Metrics matching Testable Performance Strategy
export const errorRate = new Rate('error_rate_4xx_5xx');
export const p95Latency = new Trend('p95_latency_trend');
export const successRate = new Rate('successful_request_rate');

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp-up to 20 Virtual Users
    { duration: '1m', target: 50 },   // Load testing at 50 VU
    { duration: '15s', target: 100 }, // Traffic spike up to 100 VU
    { duration: '30s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // SLA thresholds
    error_rate_4xx_5xx: ['rate<0.02'],              // <2% error rate SLA
    successful_request_rate: ['rate>0.98'],          // >98% success SLA
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3001';

export default function () {
  // 1. Health check & Security headers verification
  const healthRes = http.get(`${BASE_URL}/health`);
  const isHealthy = check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'HSTS header present': (r) => r.headers['Strict-Transport-Security'] !== undefined,
    'X-Content-Type-Options nosniff': (r) => r.headers['X-Content-Type-Options'] === 'nosniff',
  });
  errorRate.add(healthRes.status >= 400);
  successRate.add(healthRes.status === 200);

  // 2. Fetch Records List (Read throughput)
  const listRes = http.get(`${BASE_URL}/api/records`);
  check(listRes, {
    'records list status is 200': (r) => r.status === 200,
  });
  p95Latency.add(listRes.timings.duration);
  errorRate.add(listRes.status >= 400);
  successRate.add(listRes.status === 200);

  // 3. Performance Soak / Telemetry query
  const soakRes = http.get(`${BASE_URL}/api/performance/soak`);
  check(soakRes, {
    'soak telemetry status is 200': (r) => r.status === 200,
  });

  // 4. Compliance Privacy check
  const privacyRes = http.get(`${BASE_URL}/api/compliance/privacy`);
  check(privacyRes, {
    'privacy policy status is 200': (r) => r.status === 200,
  });

  sleep(0.5);
}
