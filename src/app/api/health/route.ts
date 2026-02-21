import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Try to query the database
    const assetCount = await db.asset.count()
    const taskCount = await db.task.count()
    const goalCount = await db.goal.count()

    return NextResponse.json({
      success: true,
      message: 'Database connected successfully',
      counts: {
        assets: assetCount,
        tasks: taskCount,
        goals: goalCount
      }
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      hint: 'The database tables may not exist. Make sure to run prisma db push or migrate.'
    }, { status: 500 })
  }
}
