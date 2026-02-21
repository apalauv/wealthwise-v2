import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List all goals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    const where = status ? { status } : {}
    
    const goals = await db.goal.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ success: true, data: goals })
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch goals' }, { status: 500 })
  }
}

// POST - Create new goal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, targetAmount, currentAmount, deadline, category } = body
    
    const goal = await db.goal.create({
      data: {
        name,
        description: description || null,
        targetAmount: parseFloat(targetAmount) || 0,
        currentAmount: parseFloat(currentAmount) || 0,
        deadline: deadline ? new Date(deadline) : null,
        category: category || null,
        status: 'active',
      }
    })
    
    return NextResponse.json({ success: true, data: goal })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json({ success: false, error: 'Failed to create goal' }, { status: 500 })
  }
}

// PUT - Update goal
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    
    const updateData: Record<string, unknown> = {}
    
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.targetAmount !== undefined) updateData.targetAmount = parseFloat(data.targetAmount)
    if (data.currentAmount !== undefined) updateData.currentAmount = parseFloat(data.currentAmount)
    if (data.deadline !== undefined) updateData.deadline = data.deadline ? new Date(data.deadline) : null
    if (data.category !== undefined) updateData.category = data.category
    if (data.status !== undefined) updateData.status = data.status
    
    const goal = await db.goal.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json({ success: true, data: goal })
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json({ success: false, error: 'Failed to update goal' }, { status: 500 })
  }
}

// DELETE - Delete goal
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
    }
    
    await db.goal.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete goal' }, { status: 500 })
  }
}
