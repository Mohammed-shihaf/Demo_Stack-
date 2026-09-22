import { Request, Response, NextFunction } from 'express';

/**
 * Applies HTTP Security Headers (OWASP recommendations, HSTS, CSP, X-Frame-Options)
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}

/**
 * Global Error Handler: Prevents leaking stack traces.
 */
export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
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
 * Request latency tracking middleware.
 */
export function requestMetricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const originalEnd = res.end;
  res.end = function (...args: any[]) {
    if (!res.headersSent) {
      const duration = Date.now() - start;
      res.setHeader('X-Response-Time', `${duration}ms`);
    }
    return (originalEnd as any).apply(this, args);
  };
  next();
}

export default {
  securityHeadersMiddleware,
  globalErrorHandler,
  requestMetricsMiddleware,
};
