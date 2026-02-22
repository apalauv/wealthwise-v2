import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Cointracking API configuration
// API endpoint format: https://cointracking.info/api/v1/{method}/
const COINTRACKING_API_BASE = 'https://cointracking.info/api/v1'

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
// The signature is created from the API Secret and all POST parameters
function generateSignature(apiSecret: string, postParams: URLSearchParams): string {
  // Sort parameters alphabetically by key
  const sortedParams = new URLSearchParams()
  const keys = Array.from(postParams.keys()).sort()
  for (const key of keys) {
    sortedParams.append(key, postParams.get(key) || '')
  }
  
  // Create the query string for signing
  const paramString = sortedParams.toString()
  
  return crypto
    .createHmac('sha512', apiSecret)
    .update(paramString)
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
    // Build POST parameters (empty for getBalance, but can include options)
    const postParams = new URLSearchParams()
    // No additional params needed for getBalance
    
    // Generate signature from POST parameters
    const signature = generateSignature(apiSecret, postParams)

    // The method is in the URL path, not in the body
    const response = await fetch(`${COINTRACKING_API_BASE}/getBalance/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Key': apiKey,
        'Sign': signature
      },
      body: postParams.toString()
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
        error: data.error || data.message || 'API returned error status'
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
