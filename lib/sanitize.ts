// Input validation and sanitization utilities

/**
 * Sanitizes a user ID to prevent path traversal and injection attacks
 */
export function sanitizeUserId(userId: string): string {
    if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID');
    }

    // Remove any path traversal attempts
    const cleaned = userId.replace(/\.\./g, '').replace(/[\/\\]/g, '');

    // Limit length
    if (cleaned.length > 100) {
        throw new Error('User ID too long');
    }

    // Only allow alphanumeric, dash, and underscore
    if (!/^[a-zA-Z0-9_-]+$/.test(cleaned)) {
        throw new Error('Invalid characters in user ID');
    }

    return cleaned;
}

/**
 * Validates and sanitizes numeric input
 */
export function sanitizeNumber(value: any, options: { min?: number; max?: number } = {}): number {
    const num = typeof value === 'string' ? parseInt(value, 10) : value;

    if (isNaN(num) || !isFinite(num)) {
        throw new Error('Invalid number');
    }

    if (options.min !== undefined && num < options.min) {
        throw new Error(`Value must be at least ${options.min}`);
    }

    if (options.max !== undefined && num > options.max) {
        throw new Error(`Value must be at most ${options.max}`);
    }

    return num;
}

/**
 * Validates data type value
 */
export function sanitizeDataType(dataType: string): string {
    const allowedTypes = ['ott', 'social', 'media'];

    if (!allowedTypes.includes(dataType)) {
        throw new Error(`Invalid data type. Must be one of: ${allowedTypes.join(', ')}`);
    }

    return dataType;
}

/**
 * Sanitizes string for safe display (prevents XSS)
 */
export function sanitizeString(str: string, maxLength: number = 1000): string {
    if (!str || typeof str !== 'string') {
        return '';
    }

    // Trim and limit length
    const cleaned = str.trim().substring(0, maxLength);

    // Remove any HTML tags
    return cleaned.replace(/<[^>]*>/g, '');
}
