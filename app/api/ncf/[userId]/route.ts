import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { sanitizeUserId } from '@/lib/sanitize';

const limiter = rateLimit({ windowMs: 60 * 1000, maxRequests: 30 }); // 30 requests per minute

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  // Rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimitResult = limiter(identifier);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': rateLimitResult.retryAfter?.toString() || '60'
        }
      }
    );
  }

  // Input validation
  let sanitizedUserId: string;
  try {
    sanitizedUserId = sanitizeUserId(params.userId);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Invalid user ID' },
      { status: 400 }
    );
  }

  const filePath = path.join(process.cwd(), 'public', 'recommendations', 'media_recommendations.json');

  let userItems = null;

  try {
    const data = await fs.readFile(filePath, 'utf8');
    const json = JSON.parse(data);
    userItems = json[sanitizedUserId];
  } catch (err) {
    console.warn('Could not read recommendations file or parse JSON, falling back to synthetic data:', err);
    // Proceed to synthetic generation
  }

  if (!userItems) {
    // Generate synthetic data based on userId hash so it is consistent for the same input
    // simple deterministic generator
    let hash = 0;
    for (let i = 0; i < sanitizedUserId.length; i++) {
      hash = ((hash << 5) - hash) + sanitizedUserId.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    const seed = Math.abs(hash);

    const itemCount = 5 + (seed % 15); // 5 to 19 items
    userItems = [];

    for (let i = 0; i < itemCount; i++) {
      // pseudo-random score based on seed and index
      const itemSeed = (seed * (i + 1) * 9301 + 49297) % 233280;
      const score = (itemSeed / 233280); // 0 to 1

      userItems.push({
        id: `item-${(seed + i).toString(16).substring(0, 4)}`,
        rank: i + 1,
        score: parseFloat(score.toFixed(2))
      });
    }

    // Sort by score descending
    userItems.sort((a: any, b: any) => b.score - a.score);
    // Re-assign ranks
    userItems.forEach((item: any, index: number) => { item.rank = index + 1; });
  } else {
    // Normalize data: ensure rank field exists and items are compatible
    userItems = userItems.map((item: any, index: number) => {
      return {
        ...item,
        // Ensure id exists (use itemId if id is missing)
        id: item.id || (item.itemId ? `item-${item.itemId}` : undefined),
        // Ensure rank exists (use index+1 if missing)
        rank: item.rank !== undefined ? item.rank : (index + 1)
      };
    });
  }

  return NextResponse.json({ userId: sanitizedUserId, items: userItems });
}
