import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getSession } from '@/lib/auth'

const prisma = new PrismaClient()

// Ensure unique slug
async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  let slug = baseSlug
  let counter = 1
  
  while (true) {
    const existing = await prisma.event.findUnique({ where: { slug } })
    if (!existing) return slug
    slug = `${baseSlug}-${counter}`
    counter++
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { title, description, date, time, location, backgroundImage, backgroundVideo } = data

    if (!title || !date || !time || !location) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const slug = await generateUniqueSlug(title)

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        time,
        location,
        slug,
        backgroundImage,
        backgroundVideo,
      }
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Create Event Error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
