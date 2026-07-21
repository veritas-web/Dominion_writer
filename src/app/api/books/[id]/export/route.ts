import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { bookId, format } = await request.json()
    if (!bookId || !format) {
      return NextResponse.json({ error: 'Book ID and format required' }, { status: 400 })
    }

    const book = await db.book.findUnique({
      where: { id: bookId },
      include: {
        chapters: { orderBy: { orderIndex: 'asc' } },
        frontMatter: { orderBy: { orderIndex: 'asc' } },
        backMatter: { orderBy: { orderIndex: 'asc' } },
        glossaryTerms: { orderBy: { orderIndex: 'asc' } },
        bibliographyEntries: { orderBy: { orderIndex: 'asc' } },
      },
    })
    if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 })

    await db.exportHistory.create({
      data: { bookId, format, createdAt: new Date() },
    })

    await db.book.update({ where: { id: bookId }, data: { status: 'complete' } })

    return NextResponse.json({ success: true, book })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}