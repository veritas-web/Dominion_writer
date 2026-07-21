import { db } from '@/lib/db'
import { decryptApiKey } from '@/lib/encryption'
import { NextResponse } from 'next/server'

async function callAI(userId: string, prompt: string, task: 'draft' | 'edit' | 'suggest') {
  const keys = await db.apiKey.findMany({ where: { userId } })
  if (keys.length === 0) throw new Error('No API keys configured')

  const defaultKey = keys.find(k => k.isDefault) || keys[0]
  const decryptedKey = decryptApiKey(defaultKey.encryptedKey)
  const provider = defaultKey.provider

  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${decryptedKey}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 4096 }),
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error.message)
    return json.choices[0].message.content
  }

  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': decryptedKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 4096, messages: [{ role: 'user', content: prompt }] }),
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error.message)
    return json.content[0].text
  }

  if (provider === 'google') {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${decryptedKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error.message)
    return json.candidates[0].content.parts[0].text
  }

  if (provider === 'deepseek') {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${decryptedKey}` },
      body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'user', content: prompt }], max_tokens: 4096 }),
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error.message)
    return json.choices[0].message.content
  }

  // Generic OpenAI-compatible for xai, mistral, cohere
  const endpoints: Record<string, string> = {
    xai: 'https://api.x.ai/v1/chat/completions',
    mistral: 'https://api.mistral.ai/v1/chat/completions',
    cohere: 'https://api.cohere.ai/v1/chat',
  }
  const models: Record<string, string> = {
    xai: 'grok-2',
    mistral: 'mistral-large-latest',
    cohere: 'command-r-plus',
  }

  const endpoint = endpoints[provider]
  if (!endpoint) throw new Error(`Unsupported provider: ${provider}`)

  if (provider === 'cohere') {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${decryptedKey}` },
      body: JSON.stringify({ model: models[provider], message: prompt, max_tokens: 4096 }),
    })
    const json = await res.json()
    if (json.message) return json.message
    throw new Error(json.message || 'Cohere API error')
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${decryptedKey}` },
    body: JSON.stringify({ model: models[provider], messages: [{ role: 'user', content: prompt }], max_tokens: 4096 }),
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error.message || 'API error')
  return json.choices[0].message.content
}

export async function POST(request: Request) {
  try {
    const { userId, prompt, task } = await request.json()
    if (!userId || !prompt) {
      return NextResponse.json({ error: 'User ID and prompt required' }, { status: 400 })
    }
    const result = await callAI(userId, prompt, task || 'draft')
    return NextResponse.json({ content: result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}