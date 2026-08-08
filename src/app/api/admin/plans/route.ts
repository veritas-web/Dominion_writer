import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [plans, settings] = await Promise.all([
      db.plan.findMany(),
      db.siteSettings.get(),
    ])
    return NextResponse.json({ plans, settings })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load plans' }, { status: 500 })
  }
}
