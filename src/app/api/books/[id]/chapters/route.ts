import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { bookId, title, content, orderIndex, action } = await request.json()

    if (action === 'create') {
      const maxOrder = await db.chapter.findFirst({
        where: { bookId },
        orderBy: { orderIndex: 'desc' },
        select: { orderIndex: true },
      })
      const nextOrder = (maxOrder?.orderIndex ?? -1) + 1
      const chapter = await db.chapter.create({
        data: { bookId, title: title || 'Untitled Chapter', content: content || '', orderIndex: nextOrder },
      })
      return NextResponse.json(chapter)
    }

    if (action === 'update') {
      const { id, content: chapterContent, title: chapterTitle } = await request.json()
      const wordCount = chapterContent ? chapterContent.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length : undefined
      const chapter = await db.chapter.update({
        where: { id },
        data: {
          ...(chapterTitle !== undefined ? { title: chapterTitle } : {}),
          ...(chapterContent !== undefined ? { content: chapterContent, wordCount: wordCount ?? undefined } : {}),
          updatedAt: new Date(),
        },
      })
      return NextResponse.json(chapter)
    }

    if (action === 'reorder') {
      const { chapters: chapterOrders } = await request.json()
      for (const ch of chapterOrders) {
        await db.chapter.update({ where: { id: ch.id }, data: { orderIndex: ch.orderIndex } })
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Chapter ID required' }, { status: 400 })
  await db.chapter.delete({ where: { id } })
  return NextResponse.json({ success: true })
}