import { NextResponse } from 'next/server'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL
  const directUrl = process.env.DIRECT_URL

  return NextResponse.json({
    hasDatabaseUrl: !!dbUrl,
    hasDirectUrl: !!directUrl,
    databaseUrlLength: dbUrl?.length || 0,
    directUrlLength: directUrl?.length || 0,
    databaseUrlStart: dbUrl ? dbUrl.substring(0, 30) + '...' : 'NOT SET',
    directUrlStart: directUrl ? directUrl.substring(0, 30) + '...' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
  })
}

export const dynamic = 'force-dynamic'
