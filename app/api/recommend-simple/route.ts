import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter'

const limiter = rateLimit({ windowMs: 60 * 1000, maxRequests: 20 }); // 20 requests per minute

/**
 * Simplified recommendation API that uses pre-computed recommendations
 * This is easier to deploy on Vercel (no Python runtime needed)
 * 
 * To use this instead of the Python-based route:
 * 1. Run: python scripts/precompute_recommendations.py --data-type all
 * 2. Update the frontend to call /api/recommend-simple instead of /api/recommend
 */

export async function POST(request: NextRequest) {
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

  try {
    const body = await request.json()
    const { dataType, userId, topK = 10 } = body

    // Validate inputs
    if (!dataType || typeof userId !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request. dataType and userId required.' },
        { status: 400 }
      )
    }

    // Load pre-computed recommendations
    const recommendationsPath = path.join(
      process.cwd(),
      'public',
      'recommendations',
      `${dataType}_recommendations.json`
    )

    if (!fs.existsSync(recommendationsPath)) {
      return NextResponse.json(
        {
          error: `Pre-computed recommendations not found. Run: python scripts/precompute_recommendations.py --data-type ${dataType}`,
        },
        { status: 404 }
      )
    }

    const allRecommendations = JSON.parse(
      fs.readFileSync(recommendationsPath, 'utf-8')
    )

    if (!allRecommendations[userId]) {
      return NextResponse.json(
        { error: `User ${userId} not found` },
        { status: 404 }
      )
    }

    // Get top-k recommendations for this user
    const userRecs = allRecommendations[userId].slice(0, topK)

    return NextResponse.json({
      recommendations: userRecs,
      userId: userId,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

