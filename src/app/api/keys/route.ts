import { db } from '@/lib/db'
import { encryptApiKey, decryptApiKey, maskApiKey } from '@/lib/encryption'
import { NextResponse } from 'next/server'

const PROVIDERS = ['openai', 'anthropic', 'google', 'xai', 'mistral', 'deepseek', 'cohere'] as const

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 })

  const keys = await db.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  const safe = keys.map(k => ({
    id: k.id,
    provider: k.provider,
    label: k.label,
    isDefault: k.isDefault,
    maskedKey: maskApiKey(k.encryptedKey.split(':')[1]),
    createdAt: k.createdAt,
  }))

  return NextResponse.json(safe)
}

export async function POST(request: Request) {
  try {
    const { userId, provider, apiKey, label, isDefault } = await request.json()
    if (!userId || !provider || !apiKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!PROVIDERS.includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }

    const userKeys = await db.apiKey.findMany({ where: { userId } })
    if (userKeys.length >= 3) {
      return NextResponse.json({ error: 'Maximum 3 API keys allowed' }, { status: 400 })
    }

    const encrypted = encryptApiKey(apiKey)

    if (isDefault) {
      await db.apiKey.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } })
    }

    const key = await db.apiKey.create({
      data: { userId, provider, encryptedKey: encrypted, label, isDefault: isDefault || false },
    })

    return NextResponse.json({
      id: key.id,
      provider: key.provider,
      label: key.label,
      isDefault: key.isDefault,
      maskedKey: maskApiKey(encrypted.split(':')[1]),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const keyId = searchParams.get('id')
  if (!keyId) return NextResponse.json({ error: 'Key ID required' }, { status: 400 })

  await db.apiKey.delete({ where: { id: keyId } })
  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request) {
  try {
    const { keyId, isDefault, userId } = await request.json()
    if (!keyId || !userId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    if (isDefault) {
      await db.apiKey.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } })
    }
    const updated = await db.apiKey.update({ where: { id: keyId }, data: { isDefault } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}