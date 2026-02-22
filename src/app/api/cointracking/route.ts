import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Cointracking API configuration
const COINTRACKING_API_URL = 'https://cointracking.info/api/v1'

interface CointrackingBalance {
  Account: string
  Amount: number
  Value: number
  ValueUSD: number
  Currency: string
}

interface CointrackingResponse {
  success: boolean
  balances?: CointrackingBalance[]
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

// Generate HMAC signature for Cointracking API
function generateSignature(apiKey: string, apiSecret: string, params: Record<string, string>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')

  return crypto
    .createHmac('sha512', apiSecret)
    .update(sortedParams)
    .digest('hex')
}

async function fetchCointrackingBalance(): Promise<CointrackingResponse> {
  // Support both naming conventions
  const apiKey = process.env.COINTRACKING_API_KEY || process.env.NEXT_PUBLIC_COINTRACKING_API_KEY
  const apiSecret = process.env.COINTRACKING_API_SECRET || process.env.NEXT_PUBLIC_COINTRACKING_API_SECRET

  if (!apiKey || !apiSecret) {
    return {
      success: false,
      error: 'Cointracking API credentials not configured. Please add COINTRACKING_API_KEY and COINTRACKING_API_SECRET to environment variables.'
    }
  }

  try {
    const params: Record<string, string> = {}
    const signature = generateSignature(apiKey, apiSecret, params)

    const response = await fetch(`${COINTRACKING_API_URL}/getBalance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Key': apiKey,
        'Sign': signature
      },
      body: new URLSearchParams(params).toString()
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.status !== 'success') {
      return {
        success: false,
        error: data.error || 'Unknown error from Cointracking API'
      }
    }

    // Process balances
    const items = Object.entries(data.data || {}).map(([currency, info]: [string, any]) => {
      const amount = parseFloat(info.amount || 0)
      const valueEUR = parseFloat(info.value_eur || info.value || 0)
      const valueUSD = parseFloat(info.value_usd || 0)
      const cost = parseFloat(info.cost || 0)
      const gainLoss = valueEUR - cost
      const gainLossPercent = cost > 0 ? ((gainLoss / cost) * 100) : 0

      return {
        symbol: currency,
        name: info.name || currency,
        amount,
        valueEUR,
        valueUSD,
        gainLoss,
        gainLossPercent
      }
    }).filter(item => item.amount > 0 || item.valueEUR > 0)

    const totalValueEUR = items.reduce((sum, item) => sum + item.valueEUR, 0)
    const totalValueUSD = items.reduce((sum, item) => sum + item.valueUSD, 0)
    const totalGainLoss = items.reduce((sum, item) => sum + item.gainLoss, 0)

    return {
      success: true,
      summary: {
        totalValueEUR,
        totalValueUSD,
        totalGainLoss,
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
