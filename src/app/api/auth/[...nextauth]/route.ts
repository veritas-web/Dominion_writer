import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const email = credentials.email.trim().toLowerCase()
        const user = await db.user.findUnique({ where: { email } })
        if (!user || !user.passwordHash) return null
        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        const isSuperAdminEmail = email === 'admin@veritasdocs.com'
        const isAdmin = Boolean(user.isAdmin || user.role === 'ADMIN' || isSuperAdminEmail)
        const role = isAdmin ? 'ADMIN' : (user.role || 'USER')
        const planActive = Boolean(user.planActive || isAdmin)

        // Track last login in background
        db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date().toISOString() },
        }).catch((err: any) => console.error('Error updating last login:', err))

        return {
          id: user.id,
          email: user.email,
          name: user.fullName || (isAdmin ? 'Super Admin' : user.email.split('@')[0]),
          role,
          isAdmin,
          planActive,
          planType: user.planType || (isAdmin ? 'lifetime' : 'free'),
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any
        token.id = u.id
        token.email = u.email
        token.name = u.name
        token.role = u.role
        token.isAdmin = u.isAdmin
        token.planActive = u.planActive
        token.planType = u.planType
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const sUser = session.user as any
        const tokenEmail = token.email || ''
        const isSuper = tokenEmail === 'admin@veritasdocs.com'

        sUser.id = token.id as string
        sUser.role = (token.role as string) || (isSuper ? 'ADMIN' : 'USER')
        sUser.isAdmin = Boolean(token.isAdmin || isSuper || sUser.role === 'ADMIN')
        sUser.planActive = Boolean(token.planActive !== undefined ? token.planActive : isSuper)
        sUser.planType = (token.planType as string) || (isSuper ? 'lifetime' : 'free')
      }
      return session
    },
  },
  pages: {
    signIn: '/admin',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }