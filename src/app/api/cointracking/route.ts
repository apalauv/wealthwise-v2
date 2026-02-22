import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Cointracking API configuration
// Note: The API endpoint format may have changed. This implementation tries multiple endpoints.
const COINTRACKING_ENDPOINTS = [
  'https://cointracking.info/api/v1/getBalance',
  'https://cointracking.info/api/api.php'
]

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

// Generate HMAC-SHA512 signature
function generateSignature(apiSecret: string, data: string): string {
  return crypto
    .createHmac('sha512', apiSecret)
    .update(data)
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

  // Try multiple endpoints and methods
  const attempts: { endpoint: string; method: string; status: number; response: string }[] = []

  // Try v1 API endpoint
  try {
    const signature = generateSignature(apiSecret, '')
    
    const response = await fetch('https://cointracking.info/api/v1/getBalance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Key': apiKey,
        'Sign': signature
      },
      body: ''
    })

    const text = await response.text()
    attempts.push({
      endpoint: 'https://cointracking.info/api/v1/getBalance',
      method: 'POST',
      status: response.status,
      response: text.substring(0, 200)
    })

    if (response.ok && (text.startsWith('{') || text.startsWith('['))) {
      const data = JSON.parse(text)
      if (data.status === 'success' || data.data) {
        return processBalanceData(data)
      }
    }
  } catch (error) {
    attempts.push({
      endpoint: 'https://cointracking.info/api/v1/getBalance',
      method: 'POST',
      status: 0,
      response: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Try api.php endpoint with method parameter
  try {
    const postBody = 'method=getBalance'
    const signature = generateSignature(apiSecret, postBody)
    
    const response = await fetch('https://cointracking.info/api/api.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Key': apiKey,
        'Sign': signature
      },
      body: postBody
    })

    const text = await response.text()
    attempts.push({
      endpoint: 'https://cointracking.info/api/api.php',
      method: 'POST',
      status: response.status,
      response: text.substring(0, 200)
    })

    if (response.ok && (text.startsWith('{') || text.startsWith('['))) {
      const data = JSON.parse(text)
      if (data.status === 'success' || data.data) {
        return processBalanceData(data)
      }
    }
  } catch (error) {
    attempts.push({
      endpoint: 'https://cointracking.info/api/api.php',
      method: 'POST',
      status: 0,
      response: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // All attempts failed
  return {
    success: false,
    error: `Cointracking API no está disponible. Verifica que tu cuenta tenga acceso a la API (puede requerir plan Pro). Intentos: ${JSON.stringify(attempts, null, 2)}`
  }
}

function processBalanceData(data: any): CointrackingResponse {
  const balanceData = data.data || data.balances || data
  const items = Object.entries(balanceData)
    .filter(([, value]) => typeof value === 'object')
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
}

export async function GET() {
  const result = await fetchCointrackingBalance()
  return NextResponse.json(result)
}

export const dynamic = 'force-dynamic'
