import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const book = await db.book.findUnique({
    where: { id },
    include: {
      chapters: { orderBy: { orderIndex: 'asc' } },
      frontMatter: { orderBy: { orderIndex: 'asc' } },
      backMatter: { orderBy: { orderIndex: 'asc' } },
      glossaryTerms: { orderBy: { orderIndex: 'asc' } },
      bibliographyEntries: { orderBy: { orderIndex: 'asc' } },
    },
  })
  if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  return NextResponse.json(book)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await request.json()
    const book = await db.book.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
        lastAutosavedAt: new Date(),
      },
    })
    return NextResponse.json(book)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.book.delete({ where: { id } })
  return NextResponse.json({ success: true })
}