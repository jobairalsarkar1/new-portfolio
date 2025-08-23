import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth, { NextAuthConfig } from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { prisma } from "./lib/prisma"
import { JWT } from "next-auth/jwt"
import type { User } from "next-auth"

export const config = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub,
    Google,
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT
      user?: User
    }) {
      if (user) {
        const userFromDB = await prisma.user.findUnique({
          where: { id: user.id },
        })

        token.role = userFromDB?.role || "CLIENT"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
      }
      return session
    },
  },
} satisfies NextAuthConfig

export const { handlers, signIn, signOut, auth } = NextAuth(config)
