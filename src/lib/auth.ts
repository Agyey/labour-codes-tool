/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const isProd = process.env.NODE_ENV === "production";

// In production, Google OAuth secrets MUST be present — no fallbacks.
const googleClientId = process.env.GOOGLE_CLIENT_ID || (isProd ? "" : "mock-client-id");
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || (isProd ? "" : "mock-client-secret");

if (isProd && (!googleClientId || !googleClientSecret)) {
  throw new Error("[FATAL] GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in production.");
}

const providersArray: any[] = [
  GoogleProvider({
    clientId: googleClientId,
    clientSecret: googleClientSecret,
  }),
];

if (process.env.NODE_ENV !== "production") {
  providersArray.push(
    CredentialsProvider({
      name: "Local Dev Bypass",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "admin@dev.local" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: "Local Dev",
              role: "admin",
            },
          });
        }
        return user;
      },
    }),
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: providersArray,
  callbacks: {
    async signIn({ user }) {
      logger.info("Auth sign-in attempt", { email: user.email });
      // Auto-assign admin roles to our specified emails
      if (
        user.email === "shreeyash1998@gmail.com" ||
        user.email === "agyey1997@gmail.com"
      ) {
        logger.info("Auto-assigning admin role", { email: user.email });
        // Ensure role is admin in db
        await prisma.user
          .update({
            where: { email: user.email },
            data: { role: "admin" },
          })
          .catch((e: any) => {
            logger.warn("Admin role update failed (might be new user)", { error: e.message });
          });
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      logger.debug("JWT callback", { trigger, hasUser: !!user });
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "viewer";

        // Fetch orgId if not present
        const orgUser = await prisma.organizationUser.findFirst({
          where: { user_id: user.id },
          select: { org_id: true },
        });
        token.orgId = orgUser?.org_id;

        logger.debug("JWT role assigned", { role: token.role, orgId: token.orgId });
      }
      if (trigger === "update" && session?.role) {
        token.role = session.role;
        logger.debug("JWT role updated via trigger", { role: token.role });
      }
      return token;
    },
    async session({ session, token }) {
      logger.debug("Session callback", { role: token?.role });
      if (session?.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.orgId = token.orgId as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Guarantee new users get the admin role on first sign up
      if (
        user.email === "shreeyash1998@gmail.com" ||
        user.email === "agyey1997@gmail.com"
      ) {
        await prisma.user
          .update({
            where: { id: user.id },
            data: { role: "admin" },
          })
          .catch(console.error);
      }
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
