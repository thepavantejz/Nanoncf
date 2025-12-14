import { NextRequest, NextResponse } from 'next/server'
import { spawnSync } from 'child_process'
import path from 'path'
import fs from 'fs'

// This is a workaround for Next.js API routes
// In production, use a real API server for Python!

export async function POST(request: NextRequest) {
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

    // Check if model exists
    const modelPath = path.join(process.cwd(), 'models', `${dataType}_ncf.pth`)
    if (!fs.existsSync(modelPath)) {
      return NextResponse.json(
        { error: `Model not found. Please train the model first for ${dataType} data.` },
        { status: 404 }
      )
    }

    // Use sync spawn for TypeScript/Next.js API compliance
    const pythonScript = path.join(process.cwd(), 'scripts', 'inference.py')
    const result = spawnSync('python', [
      pythonScript,
      '--data-type', dataType,
      '--user-id', userId.toString(),
      '--top-k', topK.toString()
    ], { encoding: 'utf-8' })

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      )
    }

    if (result.status !== 0) {
      return NextResponse.json(
        { error: result.stderr },
        { status: 500 }
      )
    }

    try {
      const json = JSON.parse(result.stdout)
      return NextResponse.json({
        recommendations: json.recommendations,
        userId: json.userId,
      })
    } catch (err) {
      return NextResponse.json(
        { error: 'Failed to parse recommendations' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

