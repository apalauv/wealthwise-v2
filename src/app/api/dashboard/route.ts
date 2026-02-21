import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get dashboard summary
export async function GET() {
  try {
    // Get all active assets
    const assets = await db.asset.findMany({
      where: { isActive: true },
      include: {
        history: {
          orderBy: { date: 'desc' },
          take: 30
        }
      }
    })
    
    // Get snapshots
    const snapshots = await db.monthlySnapshot.findMany({
      orderBy: { date: 'desc' },
      take: 12
    })
    
    // Calculate totals by type
    const totalsByType: Record<string, number> = {
      cash: 0,
      crypto: 0,
      defi: 0,
      etf: 0,
      fund: 0,
      venture: 0,
      real_estate: 0
    }
    
    const assetsByType: Record<string, typeof assets> = {
      cash: [],
      crypto: [],
      defi: [],
      etf: [],
      fund: [],
      venture: [],
      real_estate: []
    }
    
    let totalPatrimony = 0
    let totalInvested = 0
    
    for (const asset of assets) {
      const currentValue = asset.quantity * asset.currentPrice
      const investedValue = asset.quantity * asset.buyPrice
      
      totalsByType[asset.type] = (totalsByType[asset.type] || 0) + currentValue
      assetsByType[asset.type] = assetsByType[asset.type] || []
      assetsByType[asset.type].push(asset)
      
      totalPatrimony += currentValue
      totalInvested += investedValue
    }
    
    // Calculate monthly change
    let monthlyChange = 0
    let monthlyChangePercent = 0
    let lastMonthPatrimony = 0
    
    if (snapshots.length > 0) {
      lastMonthPatrimony = snapshots[0].totalPatrimony
      monthlyChange = totalPatrimony - lastMonthPatrimony
      monthlyChangePercent = lastMonthPatrimony > 0 ? (monthlyChange / lastMonthPatrimony) * 100 : 0
    }
    
    // Calculate YTD change
    const currentYear = new Date().getFullYear()
    const ytdSnapshot = snapshots.find(s => new Date(s.date).getFullYear() === currentYear - 1 && new Date(s.date).getMonth() === 11)
    let ytdChange = 0
    let ytdChangePercent = 0
    
    if (ytdSnapshot) {
      ytdChange = totalPatrimony - ytdSnapshot.totalPatrimony
      ytdChangePercent = ytdSnapshot.totalPatrimony > 0 ? (ytdChange / ytdSnapshot.totalPatrimony) * 100 : 0
    } else if (snapshots.length > 0) {
      // Use oldest snapshot if no YTD snapshot
      const oldestSnapshot = snapshots[snapshots.length - 1]
      ytdChange = totalPatrimony - oldestSnapshot.totalPatrimony
      ytdChangePercent = oldestSnapshot.totalPatrimony > 0 ? (ytdChange / oldestSnapshot.totalPatrimony) * 100 : 0
    }
    
    // Calculate total P&L
    const totalPnL = totalPatrimony - totalInvested
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0
    
    return NextResponse.json({
      success: true,
      data: {
        totalPatrimony,
        totalInvested,
        totalPnL,
        totalPnLPercent,
        monthlyChange,
        monthlyChangePercent,
        ytdChange,
        ytdChangePercent,
        lastMonthPatrimony,
        totalsByType,
        assetsByType,
        snapshots,
        assetCount: assets.length
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch dashboard' }, { status: 500 })
  }
}
