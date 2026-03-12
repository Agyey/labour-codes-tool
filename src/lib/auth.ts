import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Auto-assign admin roles to our specified emails
      if (
        user.email === "shreeyash1998@gmail.com" ||
        user.email === "agyey1997@gmail.com"
      ) {
        // Ensure role is admin in db
        await prisma.user.update({
          where: { email: user.email },
          data: { role: "admin" },
        }).catch(() => null); // Ignore if they don't exist yet, they will get defaults from adapter
      }
      return true;
    },
    async session({ session, user }) {
      if (session?.user && user) {
        // Expose the custom ID & role
        session.user.id = user.id;
        // In reality, you'd fetch user role from db
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        session.user.role = dbUser?.role || "viewer";
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
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "admin" },
        }).catch(console.error);
      }
    },
  },
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
