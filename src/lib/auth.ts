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
      console.log("[AUTH] SignIn attempt:", user.email);
      // Auto-assign admin roles to our specified emails
      if (
        user.email === "shreeyash1998@gmail.com" ||
        user.email === "agyey1997@gmail.com"
      ) {
        console.log("[AUTH] Auto-assigning admin role to:", user.email);
        // Ensure role is admin in db
        await prisma.user.update({
          where: { email: user.email },
          data: { role: "admin" },
        }).catch((e) => {
          console.log("[AUTH] Update for admin role failed (might be new user):", e.message);
        }); 
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      console.log("[AUTH] JWT Callback. Trigger:", trigger, "User present:", !!user);
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "viewer";
        
        // Fetch orgId if not present
        const orgUser = await prisma.organizationUser.findFirst({
          where: { user_id: user.id },
          select: { org_id: true }
        });
        token.orgId = orgUser?.org_id;
        
        console.log("[AUTH] Initial JWT role assigned:", token.role, "Org:", token.orgId);
      }
      if (trigger === "update" && session?.role) {
        token.role = session.role;
        console.log("[AUTH] JWT role updated via trigger:", token.role);
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[AUTH] Session Callback. Token role:", token?.role);
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
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "admin" },
        }).catch(console.error);
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
