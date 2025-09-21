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

// General API rate limiter - 100 requests per 15 minutes
const generalLimiter = createRateLimiter('general_rl', 100, 900);

// Auth rate limiter - 5 login attempts per 15 minutes
const authLimiter = createRateLimiter('auth_rl', 5, 900);

// Booking rate limiter - 10 bookings per hour
const bookingLimiter = createRateLimiter('booking_rl', 10, 3600);

// Upload rate limiter - 20 uploads per hour
const uploadLimiter = createRateLimiter('upload_rl', 20, 3600);

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
