import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Try to query the database
    const assetCount = await db.asset.count()
    const taskCount = await db.task.count()
    const goalCount = await db.goal.count()
    const transactionCount = await db.transaction.count()
    const snapshotCount = await db.monthlySnapshot.count()
    const whaleCount = await db.whale.count()

    return NextResponse.json({
      success: true,
      message: 'Database connected successfully!',
      timestamp: new Date().toISOString(),
      counts: {
        assets: assetCount,
        tasks: taskCount,
        goals: goalCount,
        transactions: transactionCount,
        snapshots: snapshotCount,
        whales: whaleCount
      }
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      hint: 'The database tables may not exist. Make sure to run prisma db push or migrate.',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
