import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Cointracking API configuration
const COINTRACKING_API_URL = 'https://cointracking.info/api/v1'

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

// Generate HMAC signature for Cointracking API
function generateSignature(apiSecret: string, params: Record<string, string>): string {
  // Sort params alphabetically and create query string
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
    // For getBalance, we need at least an empty params object
    const params: Record<string, string> = {}
    const signature = generateSignature(apiSecret, params)

    // Build form data body
    const formData = new URLSearchParams()
    formData.append('method', 'getBalance')

    const response = await fetch(`${COINTRACKING_API_URL}/getBalance/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Key': apiKey,
        'Sign': signature
      },
      body: formData.toString()
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
    console.log('Cointracking API response:', JSON.stringify(data).substring(0, 500))

    // Check for API-level errors
    if (data.status === 'error') {
      return {
        success: false,
        error: data.error || 'API returned error status'
      }
    }

    if (data.status !== 'success' && !data.data) {
      return {
        success: false,
        error: `Unexpected response format: ${JSON.stringify(data).substring(0, 200)}`
      }
    }

    // Process balances - format: { BTC: { amount: "1.0", value: "50000" }, ... }
    const balanceData = data.data || data.balances || data
    const items = Object.entries(balanceData)
      .filter(([currency]) => typeof balanceData[currency] === 'object')
      .map(([currency, info]: [string, any]) => {
        const amount = parseFloat(info.amount || info.Amount || 0)
        const valueEUR = parseFloat(info.value_eur || info.valueEur || info.value || info.Value || 0)
        const valueUSD = parseFloat(info.value_usd || info.valueUsd || 0)
        const cost = parseFloat(info.cost || info.Cost || 0)
        const gainLoss = valueEUR - cost
        const gainLossPercent = cost > 0 ? ((gainLoss / cost) * 100) : 0

        return {
          symbol: currency,
          name: info.name || info.Name || currency,
          amount,
          valueEUR,
          valueUSD,
          gainLoss,
          gainLossPercent
        }
      })
      .filter(item => item.amount > 0 || item.valueEUR > 0)

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
