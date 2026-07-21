'use server'

import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { encryptApiKey } from '@/lib/encryption'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, email, password, fullName, ageConfirmed } = body

    if (action === 'signup') {
      if (!email || !password || !fullName || !ageConfirmed) {
        return Response.json({ error: 'All fields are required including age confirmation' }, { status: 400 })
      }
      if (password.length < 8) {
        return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
      }
      const existing = await db.user.findUnique({ where: { email } })
      if (existing) {
        return Response.json({ error: 'An account with this email already exists' }, { status: 409 })
      }
      const passwordHash = await bcrypt.hash(password, 12)
      const user = await db.user.create({
        data: { email, fullName, passwordHash, ageConfirmed: true },
      })
      return Response.json({ id: user.id, email: user.email, fullName: user.fullName })
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error: any) {
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}