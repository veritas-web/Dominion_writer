import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dominion-writer-default-key-change-in-prod-32b!'

function getKeyBuffer(): Buffer {
  const key = ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)
  return Buffer.from(key, 'utf8')
}

function getIv(): Buffer {
  return crypto.randomBytes(16)
}

export function encryptApiKey(plainText: string): string {
  const key = getKeyBuffer()
  const iv = getIv()
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(plainText, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

export function decryptApiKey(encryptedText: string): string {
  const key = getKeyBuffer()
  const parts = encryptedText.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encrypted = parts[1]
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export function maskApiKey(key: string): string {
  if (key.length <= 8) return '****'
  return '****' + key.slice(-4)
}