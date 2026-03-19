import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 })
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Replace spaces and special chars in original name, prepend timestamp
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')
    const fileName = `${Date.now()}-${safeName}`
    
    // Save to public/uploads directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    const filePath = path.join(uploadDir, fileName)
    
    await writeFile(filePath, buffer)
    
    // Return the public URL
    const fileUrl = `/uploads/${fileName}`
    const fileType = file.type.startsWith('image/') ? 'image' : 'video'

    return NextResponse.json({ url: fileUrl, type: fileType })
  } catch (error) {
    console.error('Upload Error:', error)
    return NextResponse.json({ message: 'Upload failed' }, { status: 500 })
  }
}
