import { Client } from 'pg'
import bcrypt from 'bcryptjs'

const connectionString = 'postgresql://postgres:theboysofficia@db.yoeiaonvowsktnluphlo.supabase.co:5432/postgres'

export async function runMigration() {
  const client = new Client({ connectionString })
  await client.connect()

  try {
    console.log('--- Starting Complete Supabase Database Migration ---')

    // 1. Ensure User table has all required columns
    await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT UNIQUE NOT NULL,
        "fullName" TEXT,
        "passwordHash" TEXT,
        "role" TEXT DEFAULT 'USER',
        "isAdmin" BOOLEAN DEFAULT FALSE,
        "planActive" BOOLEAN DEFAULT FALSE,
        "planType" TEXT DEFAULT 'free',
        "stripeCustomerId" TEXT,
        "stripeSubscriptionId" TEXT,
        "status" TEXT DEFAULT 'active',
        "ageConfirmed" BOOLEAN DEFAULT TRUE,
        "lastLoginAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "fullName" TEXT;`)
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;`)
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'USER';`)
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN DEFAULT FALSE;`)
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "planActive" BOOLEAN DEFAULT FALSE;`)
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "planType" TEXT DEFAULT 'free';`)
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;`)
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;`)
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'active';`)
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "ageConfirmed" BOOLEAN DEFAULT TRUE;`)
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP WITH TIME ZONE;`)
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`)
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`)
    console.log('✓ User table schema updated')

    // 2. Create/Update SiteSettings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "SiteSettings" (
        "id" TEXT PRIMARY KEY,
        "stripeSecretKey" TEXT,
        "stripePublishableKey" TEXT,
        "stripeWebhookSecret" TEXT,
        "stripeMode" TEXT DEFAULT 'test',
        "currency" TEXT DEFAULT 'usd',
        "lifetimePriceId" TEXT,
        "monthlyPriceId" TEXT,
        "annualPriceId" TEXT,
        "lifetimePrice" NUMERIC DEFAULT 99,
        "monthlyPrice" NUMERIC DEFAULT 19,
        "annualPrice" NUMERIC DEFAULT 149,
        "enableStripeCheckout" BOOLEAN DEFAULT TRUE,
        "platformName" TEXT DEFAULT 'Dominion Writer',
        "supportEmail" TEXT DEFAULT 'support@veritasdocs.com',
        "defaultAiModel" TEXT DEFAULT 'gpt-4o',
        "fallbackAiApiKey" TEXT,
        "maintenanceMode" BOOLEAN DEFAULT FALSE,
        "announcementBanner" TEXT,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await client.query(`ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "stripeSecretKey" TEXT;`)
    await client.query(`ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "stripePublishableKey" TEXT;`)
    await client.query(`ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "stripeWebhookSecret" TEXT;`)
    await client.query(`ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "stripeMode" TEXT DEFAULT 'test';`)
    await client.query(`ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'usd';`)
    await client.query(`ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "lifetimePriceId" TEXT;`)
    await client.query(`ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "monthlyPriceId" TEXT;`)
    await client.query(`ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "annualPriceId" TEXT;`)
    await client.query(`ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "lifetimePrice" NUMERIC DEFAULT 99;`)
    await client.query(`ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "monthlyPrice" NUMERIC DEFAULT 19;`)
    await client.query(`ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "annualPrice" NUMERIC DEFAULT 149;`)
    await client.query(`ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "enableStripeCheckout" BOOLEAN DEFAULT TRUE;`)
    await client.query(`ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "platformName" TEXT DEFAULT 'Dominion Writer';`)
    await client.query(`ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "supportEmail" TEXT DEFAULT 'support@veritasdocs.com';`)
    await client.query(`ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "defaultAiModel" TEXT DEFAULT 'gpt-4o';`)
    await client.query(`ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "fallbackAiApiKey" TEXT;`)
    await client.query(`ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "maintenanceMode" BOOLEAN DEFAULT FALSE;`)
    await client.query(`ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "announcementBanner" TEXT;`)
    await client.query(`ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`)
    console.log('✓ SiteSettings table updated')

    // 3. Upsert default settings row
    const settingsRes = await client.query(`SELECT id FROM "SiteSettings" WHERE id = 'default'`)
    if (settingsRes.rowCount === 0) {
      await client.query(`
        INSERT INTO "SiteSettings" (
          id, "stripeMode", currency, "lifetimePrice", "monthlyPrice", "annualPrice",
          "enableStripeCheckout", "platformName", "supportEmail", "defaultAiModel",
          "updatedAt"
        ) VALUES (
          'default', 'test', 'usd', 99, 19, 149,
          TRUE, 'Dominion Writer', 'support@veritasdocs.com', 'gpt-4o',
          CURRENT_TIMESTAMP
        )
      `)
      console.log('✓ Inserted default SiteSettings row')
    }

    // 4. Create Plan table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Plan" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT UNIQUE NOT NULL,
        "price" NUMERIC NOT NULL,
        "interval" TEXT DEFAULT 'one-time',
        "stripePriceId" TEXT,
        "stripeProductId" TEXT,
        "description" TEXT,
        "features" JSONB,
        "isActive" BOOLEAN DEFAULT TRUE,
        "isPopular" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✓ Plan table ensured')

    // Seed default plans if table is empty
    const plansRes = await client.query(`SELECT id FROM "Plan" LIMIT 1`)
    if (plansRes.rowCount === 0) {
      await client.query(`
        INSERT INTO "Plan" ("id", "name", "slug", "price", "interval", "stripePriceId", "description", "features", "isActive", "isPopular")
        VALUES 
        ('plan_lifetime', 'Lifetime Access', 'lifetime', 99, 'one-time', 'price_lifetime_demo', 'One-time payment for unlimited AI writing and publishing forever.', '["Unlimited AI writing assistance", "Advanced formatting & export tools", "Export to EPUB, PDF, and DOCX", "Priority email support", "Access to all future features", "Commercial rights included"]'::jsonb, TRUE, TRUE),
        ('plan_monthly', 'Pro Monthly', 'monthly', 19, 'month', 'price_monthly_demo', 'Full AI writing platform billed month-to-month.', '["Unlimited AI book drafting", "Chapter and book management", "EPUB and PDF exports", "Custom API key support", "Standard customer support"]'::jsonb, TRUE, FALSE),
        ('plan_annual', 'Pro Annual', 'annual', 149, 'year', 'price_annual_demo', 'Save 35% with annual billing. Ideal for prolific authors.', '["Everything in Pro Monthly", "2 months free", "Priority AI generation speed", "Custom font & styling engines", "VIP publishing assistance"]'::jsonb, TRUE, FALSE);
      `)
      console.log('✓ Seeded default pricing plans')
    }

    // 5. Create AuditLog table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" TEXT PRIMARY KEY,
        "action" TEXT NOT NULL,
        "performedBy" TEXT NOT NULL,
        "targetId" TEXT,
        "details" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✓ AuditLog table ensured')

    // 6. Create Transaction table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Transaction" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT,
        "userEmail" TEXT NOT NULL,
        "amount" NUMERIC NOT NULL,
        "currency" TEXT DEFAULT 'usd',
        "status" TEXT DEFAULT 'succeeded',
        "planType" TEXT DEFAULT 'lifetime',
        "stripeSessionId" TEXT,
        "stripePaymentIntentId" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✓ Transaction table ensured')

    // 7. Create/Update Admin User
    const adminEmail = 'admin@veritasdocs.com'
    const adminPassword = 'AdminVeritasdocs@2026'
    const hash = await bcrypt.hash(adminPassword, 12)

    const userRes = await client.query(`SELECT id FROM "User" WHERE email = $1`, [adminEmail])
    if (userRes.rowCount === 0) {
      const id = 'admin_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
      await client.query(`
        INSERT INTO "User" (
          id, email, "fullName", "passwordHash", "role", "isAdmin", "planActive", "planType", "ageConfirmed", "status", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, 'ADMIN', TRUE, TRUE, 'lifetime', TRUE, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [id, adminEmail, 'Super Administrator', hash])
      console.log(`✓ Admin user created: ${adminEmail}`)
    } else {
      // Update existing admin user to ensure password, role, and planActive are set
      await client.query(`
        UPDATE "User"
        SET "passwordHash" = $1, "role" = 'ADMIN', "isAdmin" = TRUE, "planActive" = TRUE, "planType" = 'lifetime', "status" = 'active', "updatedAt" = CURRENT_TIMESTAMP
        WHERE email = $2
      `, [hash, adminEmail])
      console.log(`✓ Admin user updated & verified: ${adminEmail}`)
    }

    console.log('--- Migration completed successfully! ---')
  } catch (err) {
    console.error('Migration error:', err)
  } finally {
    await client.end()
  }
}

runMigration()
