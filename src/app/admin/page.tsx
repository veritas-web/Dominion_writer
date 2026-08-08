import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { AdminDashboard } from './AdminClient'
import { getAdminOverview } from './actions'

export const metadata = {
  title: 'Super Admin Control Center | Dominion Writer',
  description: 'Enterprise administration, Stripe monetization, user oversight, and platform telemetry.',
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  const overview = await getAdminOverview()

  return (
    <main className="min-h-screen bg-[#080C14] text-foreground">
      <AdminDashboard initialData={overview} session={session} />
    </main>
  )
}
