import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

// This is a workaround for Next.js API routes
// In production, you'd want a proper Python API server
// For Vercel, consider using serverless functions or a separate API

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

    // For now, we'll use a Python script to handle inference
    // In a real deployment, you'd want a proper API server
    const pythonScript = path.join(process.cwd(), 'scripts', 'inference.py')
    
    return new Promise((resolve) => {
      const python = spawn('python', [
        pythonScript,
        '--data-type', dataType,
        '--user-id', userId.toString(),
        '--top-k', topK.toString()
      ])

      let output = ''
      let errorOutput = ''

      python.stdout.on('data', (data) => {
        output += data.toString()
      })

      python.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })

      python.on('close', (code) => {
        if (code !== 0) {
          resolve(NextResponse.json(
            { error: `Python script failed: ${errorOutput}` },
            { status: 500 }
          ))
          return
        }

        try {
          const result = JSON.parse(output)
          resolve(NextResponse.json({
            recommendations: result.recommendations,
            userId: result.userId
          }))
        } catch (err) {
          resolve(NextResponse.json(
            { error: 'Failed to parse recommendations' },
            { status: 500 }
          ))
        }
      })
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

