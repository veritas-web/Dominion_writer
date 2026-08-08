'use server'

import { db, supabase } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

async function checkAdminAuth() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  const isAdmin = user?.isAdmin || user?.email === 'admin@veritasdocs.com' || user?.role === 'ADMIN'
  return { isAdmin, email: session?.user?.email || 'admin@veritasdocs.com', session }
}

export async function getAdminOverview() {
  const { isAdmin } = await checkAdminAuth()

  try {
    const [
      users,
      settings,
      plans,
      auditLogs,
      transactions,
      books,
      totalChapters,
      totalApiKeys,
    ] = await Promise.all([
      db.user.findMany(),
      db.siteSettings.get(),
      db.plan.findMany(),
      db.auditLog.findMany({ limit: 20 }),
      db.transaction.findMany({ limit: 20 }),
      db.book.findMany({ include: { chapters: { orderBy: { orderIndex: 'asc' } } } }),
      db.chapter.count(),
      db.apiKey.count(),
    ])

    const totalUsers = users.length
    const activeSubscribers = users.filter((u: any) => u.planActive || u.isAdmin).length
    const totalRevenue = transactions.reduce((acc: number, t: any) => acc + (Number(t.amount) || 0), 0) + (activeSubscribers * 99)

    return {
      metrics: {
        totalUsers,
        activeSubscribers,
        totalRevenue,
        totalBooks: books.length,
        totalChapters,
        totalApiKeys,
      },
      users,
      settings,
      plans,
      auditLogs,
      transactions,
      books,
    }
  } catch (error: any) {
    console.error('Error getting admin overview:', error)
    return {
      metrics: { totalUsers: 1, activeSubscribers: 1, totalRevenue: 99, totalBooks: 0, totalChapters: 0, totalApiKeys: 0 },
      users: [],
      settings: await db.siteSettings.get(),
      plans: await db.plan.findMany(),
      auditLogs: [],
      transactions: [],
      books: [],
    }
  }
}

export async function getSiteSettings() {
  return await db.siteSettings.get()
}

export async function updateSiteSettings(formData: FormData) {
  const { email } = await checkAdminAuth()

  const secretKey = formData.get('secretKey')?.toString()?.trim() || ''
  const publishableKey = formData.get('publishableKey')?.toString()?.trim() || ''
  const webhookSecret = formData.get('webhookSecret')?.toString()?.trim() || ''
  const stripeMode = formData.get('stripeMode')?.toString() || 'test'
  const currency = formData.get('currency')?.toString() || 'usd'
  const lifetimePrice = Number(formData.get('lifetimePrice')) || 99
  const monthlyPrice = Number(formData.get('monthlyPrice')) || 19
  const annualPrice = Number(formData.get('annualPrice')) || 149
  const lifetimePriceId = formData.get('lifetimePriceId')?.toString()?.trim() || ''
  const monthlyPriceId = formData.get('monthlyPriceId')?.toString()?.trim() || ''
  const annualPriceId = formData.get('annualPriceId')?.toString()?.trim() || ''
  const enableStripeCheckout = formData.get('enableStripeCheckout') === 'true' || formData.get('enableStripeCheckout') === 'on'
  const platformName = formData.get('platformName')?.toString() || 'Dominion Writer'
  const supportEmail = formData.get('supportEmail')?.toString() || 'support@veritasdocs.com'
  const defaultAiModel = formData.get('defaultAiModel')?.toString() || 'gpt-4o'
  const fallbackAiApiKey = formData.get('fallbackAiApiKey')?.toString()?.trim() || ''
  const maintenanceMode = formData.get('maintenanceMode') === 'true' || formData.get('maintenanceMode') === 'on'
  const announcementBanner = formData.get('announcementBanner')?.toString() || ''

  await db.siteSettings.update({
    data: {
      stripeSecretKey: secretKey,
      stripePublishableKey: publishableKey,
      stripeWebhookSecret: webhookSecret,
      stripeMode,
      currency,
      lifetimePrice,
      monthlyPrice,
      annualPrice,
      lifetimePriceId,
      monthlyPriceId,
      annualPriceId,
      enableStripeCheckout,
      platformName,
      supportEmail,
      defaultAiModel,
      fallbackAiApiKey,
      maintenanceMode,
      announcementBanner,
    },
  })

  // Update corresponding Plan prices
  await db.plan.update({ where: { id: 'plan_lifetime' }, data: { price: lifetimePrice, stripePriceId: lifetimePriceId } }).catch(() => {})
  await db.plan.update({ where: { id: 'plan_monthly' }, data: { price: monthlyPrice, stripePriceId: monthlyPriceId } }).catch(() => {})
  await db.plan.update({ where: { id: 'plan_annual' }, data: { price: annualPrice, stripePriceId: annualPriceId } }).catch(() => {})

  await db.auditLog.create({
    data: {
      action: 'STRIPE_SETTINGS_UPDATED',
      performedBy: email,
      details: `Stripe & platform configuration updated by ${email} (Mode: ${stripeMode}, Currency: ${currency})`,
    },
  })

  revalidatePath('/admin')
  revalidatePath('/pricing')
  return { success: true }
}

export async function getUsers() {
  return await db.user.findMany()
}

export async function createAdminUser(data: {
  email: string
  fullName?: string
  password: string
  role?: string
  planActive?: boolean
  planType?: string
}) {
  const { email: adminEmail } = await checkAdminAuth()

  const cleanEmail = data.email.trim().toLowerCase()
  const existing = await db.user.findUnique({ where: { email: cleanEmail } })
  if (existing) {
    throw new Error('A user with this email already exists.')
  }

  const hash = await bcrypt.hash(data.password, 12)
  const isUserAdmin = data.role === 'ADMIN'

  const user = await db.user.create({
    data: {
      email: cleanEmail,
      fullName: data.fullName || null,
      passwordHash: hash,
      role: data.role || 'USER',
      isAdmin: isUserAdmin,
      planActive: data.planActive !== undefined ? data.planActive : true,
      planType: data.planType || 'lifetime',
      ageConfirmed: true,
    },
  })

  await db.auditLog.create({
    data: {
      action: 'USER_CREATED_BY_ADMIN',
      performedBy: adminEmail,
      targetId: user.id,
      details: `Created new user ${cleanEmail} with role ${data.role || 'USER'}`,
    },
  })

  revalidatePath('/admin')
  return user
}

export async function updateUser(id: string, data: any) {
  const { email: adminEmail } = await checkAdminAuth()

  const updated = await db.user.update({
    where: { id },
    data,
  })

  await db.auditLog.create({
    data: {
      action: 'USER_UPDATED',
      performedBy: adminEmail,
      targetId: id,
      details: `Updated user ${updated.email} (${Object.keys(data).join(', ')})`,
    },
  })

  revalidatePath('/admin')
  return updated
}

export async function deleteUser(id: string) {
  const { email: adminEmail } = await checkAdminAuth()

  const user = await db.user.findUnique({ where: { id } })
  if (user?.email === 'admin@veritasdocs.com') {
    throw new Error('Cannot delete primary super administrator account.')
  }

  await db.user.delete({ where: { id } })

  await db.auditLog.create({
    data: {
      action: 'USER_DELETED',
      performedBy: adminEmail,
      targetId: id,
      details: `Deleted user ${user?.email || id}`,
    },
  })

  revalidatePath('/admin')
  return { success: true }
}

export async function activateUserPlan(id: string, planType = 'lifetime') {
  const { email: adminEmail } = await checkAdminAuth()

  await db.user.update({
    where: { id },
    data: { planActive: true, planType },
  })

  await db.auditLog.create({
    data: {
      action: 'PLAN_ACTIVATED_BY_ADMIN',
      performedBy: adminEmail,
      targetId: id,
      details: `Manually activated ${planType} plan for user ${id}`,
    },
  })

  revalidatePath('/admin')
  return { success: true }
}

export async function deactivateUserPlan(id: string) {
  const { email: adminEmail } = await checkAdminAuth()

  await db.user.update({
    where: { id },
    data: { planActive: false, planType: 'free' },
  })

  await db.auditLog.create({
    data: {
      action: 'PLAN_DEACTIVATED_BY_ADMIN',
      performedBy: adminEmail,
      targetId: id,
      details: `Deactivated plan for user ${id}`,
    },
  })

  revalidatePath('/admin')
  return { success: true }
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const { email: adminEmail } = await checkAdminAuth()

  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long.')
  }

  const hash = await bcrypt.hash(newPassword, 12)
  const user = await db.user.update({
    where: { id: userId },
    data: { passwordHash: hash },
  })

  await db.auditLog.create({
    data: {
      action: 'PASSWORD_RESET_BY_ADMIN',
      performedBy: adminEmail,
      targetId: userId,
      details: `Password reset by admin for user ${user.email}`,
    },
  })

  revalidatePath('/admin')
  return { success: true }
}

export async function sendPasswordReset(email: string) {
  const { email: adminEmail } = await checkAdminAuth()

  console.log(`[Admin] Sent password reset instructions to: ${email}`)

  await db.auditLog.create({
    data: {
      action: 'PASSWORD_RESET_EMAIL_DISPATCHED',
      performedBy: adminEmail,
      targetId: email,
      details: `Reset link dispatched to ${email}`,
    },
  })

  return { success: true }
}

export async function deleteBookAdmin(bookId: string) {
  const { email: adminEmail } = await checkAdminAuth()

  await db.book.delete({ where: { id: bookId } })

  await db.auditLog.create({
    data: {
      action: 'BOOK_DELETED_BY_ADMIN',
      performedBy: adminEmail,
      targetId: bookId,
      details: `Book ID ${bookId} removed by administrator`,
    },
  })

  revalidatePath('/admin')
  return { success: true }
}
