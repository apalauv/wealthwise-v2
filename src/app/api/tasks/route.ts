import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List all tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    
    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (category) where.category = category
    
    const tasks = await db.task.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })
    
    return NextResponse.json({ success: true, data: tasks })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// POST - Create new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, category, priority, dueDate } = body
    
    const task = await db.task.create({
      data: {
        title,
        description: description || null,
        category: category || null,
        priority: priority || 'medium',
        status: 'pending',
        dueDate: dueDate ? new Date(dueDate) : null,
      }
    })
    
    return NextResponse.json({ success: true, data: task })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ success: false, error: 'Failed to create task' }, { status: 500 })
  }
}

// PUT - Update task
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    
    const updateData: Record<string, unknown> = {}
    
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.category !== undefined) updateData.category = data.category
    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.status !== undefined) {
      updateData.status = data.status
      if (data.status === 'completed') {
        updateData.completedAt = new Date()
      }
    }
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null
    
    const task = await db.task.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json({ success: true, data: task })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ success: false, error: 'Failed to update task' }, { status: 500 })
  }
}

// DELETE - Delete task
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
    }
    
    await db.task.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete task' }, { status: 500 })
  }
}
