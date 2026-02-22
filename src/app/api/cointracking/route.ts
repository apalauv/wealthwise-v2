import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Cointracking API configuration
// URL must end with / and method goes in POST body with nonce
const COINTRACKING_API_URL = 'https://cointracking.info/api/v1/'

interface CointrackingResponse {
  success: boolean
  error?: string
  summary?: {
    totalValueEUR: number
    totalValueUSD: number
    totalGainLoss: number
    items: Array<{
      symbol: string
      name: string
      amount: number
      valueEUR: number
      valueUSD: number
      gainLoss: number
      gainLossPercent: number
    }>
  }
}

// Generate HMAC-SHA512 signature for Cointracking API
// The signature is created from the entire POST body (method + nonce + any params)
function generateSignature(apiSecret: string, postBody: string): string {
  return crypto
    .createHmac('sha512', apiSecret)
    .update(postBody)
    .digest('hex')
}

async function fetchCointrackingBalance(): Promise<CointrackingResponse> {
  const apiKey = process.env.COINTRACKING_API_KEY || process.env.NEXT_PUBLIC_COINTRACKING_API_KEY
  const apiSecret = process.env.COINTRACKING_API_SECRET || process.env.NEXT_PUBLIC_COINTRACKING_API_SECRET

  if (!apiKey || !apiSecret) {
    return {
      success: false,
      error: 'Cointracking API credentials not configured. Please add COINTRACKING_API_KEY and COINTRACKING_API_SECRET to environment variables.'
    }
  }

  try {
    // Build POST body with method and nonce (required!)
    const nonce = Date.now()
    const postBody = `method=getBalance&nonce=${nonce}`
    
    // Generate signature from the entire POST body
    const signature = generateSignature(apiSecret, postBody)

    console.log('Cointracking API request:', { postBody, signature: signature.substring(0, 20) + '...' })

    const response = await fetch(COINTRACKING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Key': apiKey,
        'Sign': signature
      },
      body: postBody
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Cointracking API HTTP error:', response.status, errorText)
      return {
        success: false,
        error: `Cointracking API error (${response.status}): ${errorText.substring(0, 200)}`
      }
    }

    const data = await response.json()
    console.log('Cointracking API response success:', data.success)

    if (!data.success) {
      return {
        success: false,
        error: data.error || data.message || 'API returned unsuccessful response'
      }
    }

    // Process balances - format from Cointracking:
    // { "success": 1, "details": { "BTC": { "amount": "1.0", "value_fiat": "50000", ... }, ... } }
    const balanceData = data.details || data.data || {}
    
    const items = Object.entries(balanceData)
      .filter(([, info]: [string, any]) => typeof info === 'object' && info.amount)
      .map(([currency, info]: [string, any]) => {
        const amount = parseFloat(info.amount || 0)
        const valueEUR = parseFloat(info.value_fiat || 0)
        const valueBTC = parseFloat(info.value_btc || 0)
        // Convert BTC to USD approximation (we'll use value_fiat as EUR)
        const valueUSD = valueEUR * 1.08 // Approximate EUR to USD
        
        return {
          symbol: info.coin || currency,
          name: currency,
          amount,
          valueEUR,
          valueUSD,
          gainLoss: 0, // Cointracking doesn't provide cost basis in getBalance
          gainLossPercent: 0
        }
      })
      .filter(item => item.amount > 0 || item.valueEUR > 0)
      .sort((a, b) => b.valueEUR - a.valueEUR)

    const totalValueEUR = items.reduce((sum, item) => sum + item.valueEUR, 0)
    const totalValueUSD = items.reduce((sum, item) => sum + item.valueUSD, 0)

    return {
      success: true,
      summary: {
        totalValueEUR,
        totalValueUSD,
        totalGainLoss: 0,
        items
      }
    }
  } catch (error) {
    console.error('Cointracking API error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch from Cointracking'
    }
  }
}

export async function GET() {
  const result = await fetchCointrackingBalance()
  return NextResponse.json(result)
}

export const dynamic = 'force-dynamic'
