import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter'

const limiter = rateLimit({ windowMs: 60 * 1000, maxRequests: 60 }); // 60 requests per minute

export async function GET(request: NextRequest) {
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
    const searchParams = request.nextUrl.searchParams
    const dataType = searchParams.get('type') || 'ott'

    const metadataPath = path.join(process.cwd(), 'data', `${dataType}_metadata.json`)

    if (!fs.existsSync(metadataPath)) {
      return NextResponse.json(
        { error: `Metadata not found for ${dataType}` },
        { status: 404 }
      )
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))

    return NextResponse.json({
      nUsers: metadata.n_users,
      nItems: metadata.n_items,
      nInteractions: metadata.n_total,
      sparsity: metadata.sparsity
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

