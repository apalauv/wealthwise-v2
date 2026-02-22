import { NextRequest, NextResponse } from 'next/server'

// Cache for crypto prices (2 minutes for more real-time updates)
let priceCache: Record<string, { price: number; timestamp: number }> = {}
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

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
  'SHIB': 'shiba-inu',
  'BCH': 'bitcoin-cash',
  'FIL': 'filecoin',
  'APT': 'aptos',
  'ARB': 'arbitrum',
  'OP': 'optimism',
  'INJ': 'injective-protocol',
  'SUI': 'sui',
  'SEI': 'sei-network',
  'TIA': 'celestia',
  'WLD': 'worldcoin-wld',
  'PEPE': 'pepe',
  'BONK': 'bonk',
  'ORDI': 'ordinals',
  'STX': 'blockstack',
  'IMX': 'immutable-x',
  'MKR': 'maker',
  'AAVE': 'aave',
  'GRT': 'the-graph',
  'SNX': 'havven',
  'LDO': 'lido-dao',
  'ENS': 'ethereum-name-service',
  'ICP': 'internet-computer',
  'FLOW': 'flow',
  'THETA': 'theta-token',
  'AXS': 'axie-infinity',
  'SAND': 'the-sandbox',
  'MANA': 'decentraland',
  'APE': 'apecoin',
  'BLUR': 'blur',
  '1INCH': '1inch',
  'COMP': 'compound-governance-token',
  'CRV': 'curve-dao-token',
  'SUSHI': 'sushi',
  'YFI': 'yearn-finance',
}

// Reverse mapping
const ID_TO_SYMBOL: Record<string, string> = Object.fromEntries(
  Object.entries(CRYPTO_IDS).map(([symbol, id]) => [id, symbol])
)

// GET - Get crypto prices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get('symbols')?.split(',').map(s => s.toUpperCase()) || Object.keys(CRYPTO_IDS)
    const currency = searchParams.get('currency') || 'eur'
    const detailed = searchParams.get('detailed') === 'true'
    
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
      // Get API key from environment
      const apiKey = process.env.COINGECKO_API_KEY || process.env.NEXT_PUBLIC_COINGECKO_API_KEY
      
      // Build URL - use pro API if key is available
      const baseUrl = apiKey 
        ? 'https://pro-api.coingecko.com/api/v3'
        : 'https://api.coingecko.com/api/v3'
      
      let url: string
      let headers: Record<string, string> = { 'Accept': 'application/json' }
      
      if (detailed) {
        // Get more detailed info including 24h change
        url = `${baseUrl}/coins/markets?ids=${idsToFetch.join(',')}&vs_currency=${currency}&price_change_percentage=24h`
        if (apiKey) {
          headers['x-cg-pro-api-key'] = apiKey
        }
      } else {
        url = `${baseUrl}/simple/price?ids=${idsToFetch.join(',')}&vs_currencies=${currency}&include_24hr_change=${detailed}`
        if (apiKey) {
          headers['x-cg-pro-api-key'] = apiKey
        }
      }
      
      const response = await fetch(url, { headers })
      
      if (!response.ok) {
        // Return cached prices if available
        if (Object.keys(cachedPrices).length > 0) {
          return NextResponse.json({ 
            success: true, 
            data: cachedPrices,
            cached: true,
            warning: 'Using cached prices due to API limit'
          })
        }
        throw new Error(`Failed to fetch prices from CoinGecko: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Process detailed response
      if (detailed && Array.isArray(data)) {
        for (const coin of data) {
          priceCache[coin.id] = {
            price: coin.current_price,
            timestamp: now
          }
          cachedPrices[coin.id] = coin.current_price
        }
        
        // Map back to symbols with detailed info
        const result: Record<string, { price: number; change24h: number; name: string; image: string }> = {}
        for (const coin of data) {
          const symbol = ID_TO_SYMBOL[coin.id] || coin.symbol.toUpperCase()
          result[symbol] = {
            price: coin.current_price,
            change24h: coin.price_change_percentage_24h || 0,
            name: coin.name,
            image: coin.image
          }
        }
        
        return NextResponse.json({ 
          success: true, 
          data: result,
          timestamp: now,
          source: 'coingecko'
        })
      }
      
      // Process simple response
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
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      timestamp: now,
      cached: idsToFetch.length === 0,
      source: 'coingecko'
    })
  } catch (error) {
    console.error('Error fetching crypto prices:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch crypto prices' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
