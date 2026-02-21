import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List all transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    
    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (category) where.category = category
    
    const transactions = await db.transaction.findMany({
      where,
      orderBy: { date: 'desc' }
    })
    
    return NextResponse.json({ success: true, data: transactions })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

// POST - Create new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, amount, type, category, date, assetId } = body
    
    const transaction = await db.transaction.create({
      data: {
        title,
        description: description || null,
        amount: parseFloat(amount) || 0,
        type: type || 'expense',
        category: category || null,
        date: date ? new Date(date) : new Date(),
        assetId: assetId || null,
      }
    })
    
    return NextResponse.json({ success: true, data: transaction })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ success: false, error: 'Failed to create transaction' }, { status: 500 })
  }
}

// PUT - Update transaction
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    
    const updateData: Record<string, unknown> = {}
    
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.amount !== undefined) updateData.amount = parseFloat(data.amount)
    if (data.type !== undefined) updateData.type = data.type
    if (data.category !== undefined) updateData.category = data.category
    if (data.date !== undefined) updateData.date = new Date(data.date)
    if (data.assetId !== undefined) updateData.assetId = data.assetId
    
    const transaction = await db.transaction.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json({ success: true, data: transaction })
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json({ success: false, error: 'Failed to update transaction' }, { status: 500 })
  }
}

// DELETE - Delete transaction
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
    }
    
    await db.transaction.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete transaction' }, { status: 500 })
  }
}
