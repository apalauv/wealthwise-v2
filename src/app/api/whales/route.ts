import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List all whales
export async function GET(request: NextRequest) {
  try {
    const whales = await db.whale.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ success: true, data: whales })
  } catch (error) {
    console.error('Error fetching whales:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch whales' }, { status: 500 })
  }
}

// POST - Create new whale
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, walletAddress, holdings, notes } = body
    
    const whale = await db.whale.create({
      data: {
        name,
        description: description || null,
        walletAddress: walletAddress || null,
        holdings: holdings || null,
        notes: notes || null,
      }
    })
    
    return NextResponse.json({ success: true, data: whale })
  } catch (error) {
    console.error('Error creating whale:', error)
    return NextResponse.json({ success: false, error: 'Failed to create whale' }, { status: 500 })
  }
}

// PUT - Update whale
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    
    const updateData: Record<string, unknown> = { lastUpdated: new Date() }
    
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.walletAddress !== undefined) updateData.walletAddress = data.walletAddress
    if (data.holdings !== undefined) updateData.holdings = data.holdings
    if (data.notes !== undefined) updateData.notes = data.notes
    
    const whale = await db.whale.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json({ success: true, data: whale })
  } catch (error) {
    console.error('Error updating whale:', error)
    return NextResponse.json({ success: false, error: 'Failed to update whale' }, { status: 500 })
  }
}

// DELETE - Delete whale
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
    }
    
    await db.whale.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting whale:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete whale' }, { status: 500 })
  }
}
