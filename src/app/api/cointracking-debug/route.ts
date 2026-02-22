import { NextResponse } from 'next/server'

export async function GET() {
  // Support both naming conventions
  const apiKey = process.env.COINTRACKING_API_KEY || process.env.NEXT_PUBLIC_COINTRACKING_API_KEY
  const apiSecret = process.env.COINTRACKING_API_SECRET || process.env.NEXT_PUBLIC_COINTRACKING_API_SECRET

  return NextResponse.json({
    hasApiKey: !!apiKey,
    hasApiSecret: !!apiSecret,
    apiKeyLength: apiKey?.length || 0,
    apiSecretLength: apiSecret?.length || 0,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'NOT SET',
    source: process.env.COINTRACKING_API_KEY ? 'COINTRACKING_API_KEY' : 
            process.env.NEXT_PUBLIC_COINTRACKING_API_KEY ? 'NEXT_PUBLIC_COINTRACKING_API_KEY' : 'NOT FOUND'
  })
}

export const dynamic = 'force-dynamic'
