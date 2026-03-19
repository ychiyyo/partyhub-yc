import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { logActivity } from '@/lib/logger'


// GET: Fetch guest and event info for the public invite page
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const token = (await params).token
    const guest = await prisma.guest.findUnique({
      where: { token },
      include: { event: true }
    })

    if (!guest) {
      return NextResponse.json({ message: 'Guest not found' }, { status: 404 })
    }

    return NextResponse.json(guest)
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const token = (await params).token
    const data = await request.json()
    const { rsvpStatus, plusOnes, dietaryRestrictions, notes } = data

    const guest = await prisma.guest.update({
      where: { token },
      data: {
        rsvpStatus,
        plusOnes: parseInt(plusOnes) || 0,
        dietaryRestrictions,
        notes,
      },
      include: { event: true }
    })

    await logActivity('RSVP_SUBMIT', 'SUCCESS', { guestId: guest.id, status: rsvpStatus, eventId: guest.eventId })
    return NextResponse.json(guest)
  } catch (error: any) {
    await logActivity('RSVP_SUBMIT', 'ERROR', { message: error.message })
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
