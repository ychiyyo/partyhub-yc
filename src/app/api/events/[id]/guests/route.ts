import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getSession } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, phone } = await request.json()

    if (!name || (!email && !phone)) {
      return NextResponse.json({ message: 'Name and at least one contact method (email or phone) are required' }, { status: 400 })
    }

    // Verify event exists
    const event = await prisma.event.findUnique({ where: { id: (await params).id } })
    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 })
    }

    const guest = await prisma.guest.create({
      data: {
        name,
        email,
        phone,
        eventId: (await params).id,
        // token is generated automatically via Prisma default(uuid())
      }
    })

    return NextResponse.json(guest, { status: 201 })
  } catch (error) {
    console.error('Add Guest Error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
