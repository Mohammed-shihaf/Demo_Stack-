'use strict';

/**
 * Applies HTTP Security Headers (OWASP recommendations, HSTS, CSP, X-Frame-Options, etc.)
 */
function securityHeadersMiddleware(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}

/**
 * Global Error Handler: Prevents leaking stack traces or internal implementation details.
 */
function globalErrorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : err.message || 'An unexpected error occurred';

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Request logging / APM latency tracking middleware
 */
function requestMetricsMiddleware(req, res, next) {
  const start = Date.now();
  const originalEnd = res.end;
  res.end = function (...args) {
    if (!res.headersSent) {
      const duration = Date.now() - start;
      res.setHeader('X-Response-Time', `${duration}ms`);
    }
    return originalEnd.apply(this, args);
  };
  next();
}

module.exports = {
  securityHeadersMiddleware,
  globalErrorHandler,
  requestMetricsMiddleware,
};
