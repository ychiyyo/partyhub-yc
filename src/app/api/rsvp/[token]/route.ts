import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: Fetch guest and event info for the public invite page
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const guest = await prisma.guest.findUnique({
      where: { token: (await params).token },
      include: {
        event: {
          select: {
            title: true,
            description: true,
            date: true,
            time: true,
            location: true,
            backgroundImage: true,
            backgroundVideo: true,
          }
        }
      }
    })

    if (!guest) {
      return NextResponse.json({ message: 'Invalid invite link' }, { status: 404 })
    }

    return NextResponse.json(guest, { status: 200 })
  } catch (error) {
    console.error('Fetch RSVP Error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Submit RSVP status
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { rsvpStatus, plusOnes, dietaryRestrictions, notes } = await request.json()

    // Status validation
    if (!['yes', 'no', 'maybe'].includes(rsvpStatus)) {
      return NextResponse.json({ message: 'Invalid RSVP status' }, { status: 400 })
    }

    const updatedGuest = await prisma.guest.update({
      where: { token: (await params).token },
      data: {
        rsvpStatus,
        plusOnes: rsvpStatus === 'yes' ? parseInt(plusOnes) || 0 : 0,
        dietaryRestrictions,
        notes,
      }
    })

    return NextResponse.json(updatedGuest, { status: 200 })
  } catch (error) {
    console.error('Update RSVP Error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
