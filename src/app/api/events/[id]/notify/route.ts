import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { processNotifications } from '@/lib/notifications'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { type } = await request.json()

    if (!['invite', 'reminder', 'thankyou'].includes(type)) {
      return NextResponse.json({ message: 'Invalid notification type' }, { status: 400 })
    }

    const results = await processNotifications((await params).id, type as "invite" | "reminder" | "thankyou")

    return NextResponse.json({ 
      message: `Processed notifications for ${results.length} guests`,
      results 
    }, { status: 200 })
  } catch (error: any) {
    console.error('Notify Error:', error)
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 })
  }
}
