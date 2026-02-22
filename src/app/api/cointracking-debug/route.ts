import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.COINTRACKING_API_KEY
  const apiSecret = process.env.COINTRACKING_API_SECRET

  return NextResponse.json({
    hasApiKey: !!apiKey,
    hasApiSecret: !!apiSecret,
    apiKeyLength: apiKey?.length || 0,
    apiSecretLength: apiSecret?.length || 0,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'NOT SET',
  })
}

export const dynamic = 'force-dynamic'
