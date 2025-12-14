// Simple in-memory rate limiter
// For production, use Redis or a proper rate limiting service

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old entries every 10 minutes
setInterval(() => {
    const now = Date.now();
    Array.from(rateLimitMap.entries()).forEach(([key, value]) => {
        if (now > value.resetTime) {
            rateLimitMap.delete(key);
        }
    });
}, 10 * 60 * 1000);

export interface RateLimiterConfig {
    windowMs?: number; // Time window in milliseconds
    maxRequests?: number; // Max requests per window
}

export function rateLimit(config: RateLimiterConfig = {}) {
    const windowMs = config.windowMs || 60 * 1000; // 1 minute default
    const maxRequests = config.maxRequests || 60; // 60 requests per minute default

    return (identifier: string): { allowed: boolean; retryAfter?: number } => {
        const now = Date.now();
        const entry = rateLimitMap.get(identifier);

        if (!entry || now > entry.resetTime) {
            // New window
            rateLimitMap.set(identifier, {
                count: 1,
                resetTime: now + windowMs,
            });
            return { allowed: true };
        }

        if (entry.count < maxRequests) {
            // Within limit
            entry.count++;
            return { allowed: true };
        }

        // Rate limit exceeded
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        return { allowed: false, retryAfter };
    };
}

// Helper to get client identifier from request
export function getClientIdentifier(request: Request): string {
    // Try to get IP from various headers (for proxies/CDNs)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');

    return cfConnectingIp || realIp || forwardedFor?.split(',')[0] || 'unknown';
}
