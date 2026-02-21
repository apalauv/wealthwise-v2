import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List all snapshots
export async function GET(request: NextRequest) {
  try {
    const snapshots = await db.monthlySnapshot.findMany({
      orderBy: { date: 'desc' }
    })
    
    return NextResponse.json({ success: true, data: snapshots })
  } catch (error) {
    console.error('Error fetching snapshots:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch snapshots' }, { status: 500 })
  }
}

// POST - Create monthly snapshot (Cerrar Mes)
export async function POST(request: NextRequest) {
  try {
    // Get all assets and calculate totals
    const assets = await db.asset.findMany({
      where: { isActive: true }
    })
    
    let cashValue = 0
    let cryptoValue = 0
    let defiValue = 0
    let etfValue = 0
    let fundValue = 0
    let ventureValue = 0
    let realEstateValue = 0
    
    for (const asset of assets) {
      const value = asset.quantity * asset.currentPrice
      
      switch (asset.type) {
        case 'cash':
          cashValue += value
          break
        case 'crypto':
          cryptoValue += value
          break
        case 'defi':
          defiValue += value
          break
        case 'etf':
          etfValue += value
          break
        case 'fund':
          fundValue += value
          break
        case 'venture':
          ventureValue += value
          break
        case 'real_estate':
          realEstateValue += value
          break
      }
    }
    
    const totalPatrimony = cashValue + cryptoValue + defiValue + etfValue + fundValue + ventureValue + realEstateValue
    
    const snapshot = await db.monthlySnapshot.create({
      data: {
        totalPatrimony,
        cashValue,
        cryptoValue,
        defiValue,
        etfValue,
        fundValue,
        ventureValue,
        realEstateValue,
      }
    })
    
    return NextResponse.json({ success: true, data: snapshot })
  } catch (error) {
    console.error('Error creating snapshot:', error)
    return NextResponse.json({ success: false, error: 'Failed to create snapshot' }, { status: 500 })
  }
}

// DELETE - Delete snapshot
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
    }
    
    await db.monthlySnapshot.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting snapshot:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete snapshot' }, { status: 500 })
  }
}
