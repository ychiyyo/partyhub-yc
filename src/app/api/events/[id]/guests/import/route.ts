import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getSession } from '@/lib/auth'
import { parse } from 'csv-parse/sync'

const prisma = new PrismaClient()

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Verify event exists
    const event = await prisma.event.findUnique({ where: { id } })
    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ message: 'No CSV file uploaded' }, { status: 400 })
    }

    const fileContent = await file.text()
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })

    if (!records || records.length === 0) {
      return NextResponse.json({ message: 'CSV file is empty or invalid' }, { status: 400 })
    }

    // Validate headers (csv-parse automatically uses the first row as object keys)
    const firstRow = records[0] as any
    if (!firstRow.name || (!firstRow.email && !firstRow.phone)) {
      return NextResponse.json({ 
        message: 'CSV must contain exactly "name" and at least one of "email" or "phone" headers.' 
      }, { status: 400 })
    }

    // Prepare data for bulk insert
    const validGuests = records
      .filter((row: any) => row.name && (row.email || row.phone))
      .map((row: any) => ({
        name: row.name,
        email: row.email || null,
        phone: row.phone || null,
        eventId: id,
      }))

    if (validGuests.length === 0) {
      return NextResponse.json({ message: 'No valid rows found in CSV.' }, { status: 400 })
    }

    // Bulk insert
    const result = await prisma.guest.createMany({
      data: validGuests,
    })

    return NextResponse.json({ count: result.count, message: 'Import successful' }, { status: 201 })
  } catch (error: any) {
    console.error('Import CSV Error:', error)
    return NextResponse.json({ message: error.message || 'Failed to parse CSV' }, { status: 500 })
  }
}
