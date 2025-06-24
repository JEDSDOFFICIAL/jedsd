import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user:DefaultSession['user']& {
      id: string;
      email: string;
      userType: string;
      image?: string | null; // Optional, as it may not always be present
      name?: string; // Optional, as it may not always be present
    };
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    userType: string;
    image?: string | null; // Optional, as it may not always be present
    name?: string; // Optional, as it may not always be present
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    userType: string;
    image?: string | null; // Optional, as it may not always be present
    name?: string; // Optional, as it may not always be present
  }
}
