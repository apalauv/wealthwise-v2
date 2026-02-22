import { NextRequest, NextResponse } from 'next/server'

// Cache for market data (2 minutes)
let marketCache: { data: any[]; timestamp: number } | null = null
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

// GET - Get top crypto market data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currency = searchParams.get('currency') || 'eur'
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    
    const now = Date.now()
    
    // Check cache
    if (marketCache && (now - marketCache.timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: marketCache.data.slice(0, limit),
        cached: true,
        timestamp: marketCache.timestamp,
        source: 'coingecko'
      })
    }
    
    // Get API key from environment
    const apiKey = process.env.COINGECKO_API_KEY || process.env.NEXT_PUBLIC_COINGECKO_API_KEY
    
    // Build URL - use pro API if key is available
    const baseUrl = apiKey 
      ? 'https://pro-api.coingecko.com/api/v3'
      : 'https://api.coingecko.com/api/v3'
    
    const url = `${baseUrl}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=100&page=${page}&sparkline=false&price_change_percentage=24h,7d`
    
    const headers: Record<string, string> = { 'Accept': 'application/json' }
    if (apiKey) {
      headers['x-cg-pro-api-key'] = apiKey
    }
    
    const response = await fetch(url, { headers })
    
    if (!response.ok) {
      // Return cached data if available
      if (marketCache) {
        return NextResponse.json({
          success: true,
          data: marketCache.data.slice(0, limit),
          cached: true,
          warning: 'Using cached data due to API error'
        })
      }
      throw new Error(`CoinGecko API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Process and cache data
    const processedData = data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      currentPrice: coin.current_price,
      marketCap: coin.market_cap,
      marketCapRank: coin.market_cap_rank,
      totalVolume: coin.total_volume,
      high24h: coin.high_24h,
      low24h: coin.low_24h,
      priceChange24h: coin.price_change_24h,
      priceChangePercentage24h: coin.price_change_percentage_24h,
      priceChangePercentage7d: coin.price_change_percentage_7d_in_currency,
      circulatingSupply: coin.circulating_supply,
      totalSupply: coin.total_supply,
      lastUpdated: coin.last_updated
    }))
    
    marketCache = {
      data: processedData,
      timestamp: now
    }
    
    return NextResponse.json({
      success: true,
      data: processedData.slice(0, limit),
      cached: false,
      timestamp: now,
      source: 'coingecko'
    })
  } catch (error) {
    console.error('Error fetching crypto market data:', error)
    
    // Return cached data if available
    if (marketCache) {
      return NextResponse.json({
        success: true,
        data: marketCache.data,
        cached: true,
        warning: 'Using cached data due to error'
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch crypto market data' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
