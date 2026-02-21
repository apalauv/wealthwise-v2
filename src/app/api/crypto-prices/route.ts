import { NextRequest, NextResponse } from 'next/server'

// Cache for crypto prices (5 minutes)
let priceCache: Record<string, { price: number; timestamp: number }> = {}
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Popular crypto IDs for CoinGecko
const CRYPTO_IDS: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'BNB': 'binancecoin',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'SOL': 'solana',
  'DOT': 'polkadot',
  'DOGE': 'dogecoin',
  'AVAX': 'avalanche-2',
  'MATIC': 'matic-network',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'LTC': 'litecoin',
  'NEAR': 'near',
  'FTM': 'fantom',
  'ALGO': 'algorand',
  'XLM': 'stellar',
  'HBAR': 'hedera-hashgraph',
  'VET': 'vechain',
}

// GET - Get crypto prices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get('symbols')?.split(',').map(s => s.toUpperCase()) || Object.keys(CRYPTO_IDS)
    const currency = searchParams.get('currency') || 'eur'
    
    const ids = symbols
      .map(s => CRYPTO_IDS[s])
      .filter(Boolean)
    
    if (ids.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid crypto symbols' }, { status: 400 })
    }
    
    // Check cache
    const now = Date.now()
    const cachedPrices: Record<string, number> = {}
    const idsToFetch: string[] = []
    
    for (const id of ids) {
      const cached = priceCache[id]
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        cachedPrices[id] = cached.price
      } else {
        idsToFetch.push(id)
      }
    }
    
    // Fetch new prices if needed
    if (idsToFetch.length > 0) {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsToFetch.join(',')}&vs_currencies=${currency}`
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        }
      })
      
      if (!response.ok) {
        // Return cached prices if available
        if (Object.keys(cachedPrices).length > 0) {
          return NextResponse.json({ 
            success: true, 
            data: cachedPrices,
            cached: true
          })
        }
        throw new Error('Failed to fetch prices from CoinGecko')
      }
      
      const data = await response.json()
      
      // Update cache
      for (const id of idsToFetch) {
        if (data[id]) {
          priceCache[id] = {
            price: data[id][currency],
            timestamp: now
          }
          cachedPrices[id] = data[id][currency]
        }
      }
    }
    
    // Map back to symbols
    const result: Record<string, number> = {}
    for (const symbol of symbols) {
      const id = CRYPTO_IDS[symbol]
      if (id && cachedPrices[id]) {
        result[symbol] = cachedPrices[id]
      }
    }
    
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error fetching crypto prices:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch crypto prices' }, { status: 500 })
  }
}
