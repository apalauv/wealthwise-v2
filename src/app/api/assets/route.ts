import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List all assets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    const where = type ? { type } : {}
    
    const assets = await db.asset.findMany({
      where,
      include: {
        history: {
          orderBy: { date: 'desc' },
          take: 30
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ success: true, data: assets })
  } catch (error) {
    console.error('Error fetching assets:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch assets' }, { status: 500 })
  }
}

// POST - Create new asset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, quantity, buyPrice, currentPrice, currency, symbol, description, platform, wallet } = body
    
    const asset = await db.asset.create({
      data: {
        name,
        type,
        quantity: parseFloat(quantity) || 0,
        buyPrice: parseFloat(buyPrice) || 0,
        currentPrice: parseFloat(currentPrice) || 0,
        currency: currency || 'EUR',
        symbol: symbol || null,
        description: description || null,
        platform: platform || null,
        wallet: wallet || null,
      }
    })
    
    // Create initial history entry
    if (asset.currentPrice > 0) {
      await db.assetHistory.create({
        data: {
          assetId: asset.id,
          price: asset.currentPrice
        }
      })
    }
    
    return NextResponse.json({ success: true, data: asset })
  } catch (error) {
    console.error('Error creating asset:', error)
    return NextResponse.json({ success: false, error: 'Failed to create asset' }, { status: 500 })
  }
}

// PUT - Update asset
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    
    const updateData: Record<string, unknown> = {}
    
    if (data.name !== undefined) updateData.name = data.name
    if (data.quantity !== undefined) updateData.quantity = parseFloat(data.quantity)
    if (data.buyPrice !== undefined) updateData.buyPrice = parseFloat(data.buyPrice)
    if (data.currentPrice !== undefined) updateData.currentPrice = parseFloat(data.currentPrice)
    if (data.currency !== undefined) updateData.currency = data.currency
    if (data.symbol !== undefined) updateData.symbol = data.symbol
    if (data.description !== undefined) updateData.description = data.description
    if (data.platform !== undefined) updateData.platform = data.platform
    if (data.wallet !== undefined) updateData.wallet = data.wallet
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    
    const asset = await db.asset.update({
      where: { id },
      data: updateData
    })
    
    // Create history entry if price updated
    if (data.currentPrice !== undefined) {
      await db.assetHistory.create({
        data: {
          assetId: id,
          price: parseFloat(data.currentPrice)
        }
      })
    }
    
    return NextResponse.json({ success: true, data: asset })
  } catch (error) {
    console.error('Error updating asset:', error)
    return NextResponse.json({ success: false, error: 'Failed to update asset' }, { status: 500 })
  }
}

// DELETE - Delete asset
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
    }
    
    await db.asset.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting asset:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete asset' }, { status: 500 })
  }
}
