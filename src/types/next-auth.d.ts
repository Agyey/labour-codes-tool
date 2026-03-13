import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    orgId?: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      orgId?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
