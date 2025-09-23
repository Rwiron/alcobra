import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Create different rate limiters for different endpoints (using memory store)
const createRateLimiter = (keyPrefix: string, points: number, duration: number) => {
  return new RateLimiterMemory({
    keyPrefix,
    points, // Number of requests
    duration, // Per duration in seconds
  });
};

// General API rate limiter - 1000 requests per 15 minutes (very generous for development)
const generalLimiter = createRateLimiter('general_rl', 1000, 900);

// Auth rate limiter - 100 login attempts per 15 minutes (generous for development)
const authLimiter = createRateLimiter('auth_rl', 100, 900);

// Booking rate limiter - 100 bookings per hour (generous for development)
const bookingLimiter = createRateLimiter('booking_rl', 100, 3600);

// Upload rate limiter - 100 uploads per hour (generous for development)
const uploadLimiter = createRateLimiter('upload_rl', 100, 3600);

const rateLimitHandler = (limiter: RateLimiterMemory) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = req.ip || 'unknown';
      await limiter.consume(key);
      next();
    } catch (rateLimiterRes: any) {
      const secs = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1;

      res.set('Retry-After', String(secs));
      res.status(429).json({
        success: false,
        message: 'Too many requests',
        retryAfter: secs,
      });
    }
  };
};

// Export different rate limiters
export const rateLimiter = rateLimitHandler(generalLimiter);
export const authRateLimit = rateLimitHandler(authLimiter);
export const bookingRateLimit = rateLimitHandler(bookingLimiter);
export const uploadRateLimit = rateLimitHandler(uploadLimiter);

// Export the limiters for manual reset (development only)
export const resetAuthLimiter = (ip: string) => {
  return authLimiter.delete(ip);
};

export const resetAllLimiters = (ip: string) => {
  return Promise.all([
    generalLimiter.delete(ip),
    authLimiter.delete(ip),
    bookingLimiter.delete(ip),
    uploadLimiter.delete(ip)
  ]);
};
