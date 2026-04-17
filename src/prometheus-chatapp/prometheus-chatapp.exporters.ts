import { Counter, Gauge, Histogram, exponentialBuckets } from 'prom-client';

export const restResponseTimeHistogram = new Histogram({
  name: 'rest_response_time_duration_seconds',
  help: 'Database response time in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: exponentialBuckets(1, 2, 5),
});

export const databaseResponseTimeHistogram = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Database response time in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5], // client.linearBuckets(5, 10, 15)
});

export const totalRequestConter = new Counter({
  name: 'chat_app_http_requests_total',
  help: 'Total number of HTTP requests received',
  labelNames: ['method', 'route', 'status'],
});

export const totalMessagesConter = new Gauge({
  name: 'chat_app_socket_messages_total',
  help: 'Total number of messages sent',
  labelNames: ['method'],
});

export const totalSocketCounter = new Counter({
  name: 'chat_app_socket_ws_exception_total',
  help: 'Total number of WS error exception received',
  labelNames: ['method', 'route'],
});

export const httpRequestSizeBytes = new Histogram({
  name: 'http_request_size_bytes',
  help: 'Size of incoming HTTP requests in bytes',
  labelNames: ['method', 'route', 'status'],
  buckets: [100, 500, 1000, 5000, 10000, 50000], // Adjust based on typical sizes
});

export const httpResponseSizeBytes = new Histogram({
  name: 'http_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['method', 'route', 'status'],
  buckets: [100, 500, 1000, 5000, 10000, 50000],
});
