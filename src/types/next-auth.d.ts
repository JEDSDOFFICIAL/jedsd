import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { UserType } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user:DefaultSession['user']& {
      id: string;
      email: string;
      userType: UserType;
      // Optional properties for user details
      image?: string | null; // Optional, as it may not always be present
      name?: string; // Optional, as it may not always be present
    };
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    userType: UserType;
    image?: string | null; // Optional, as it may not always be present
    name?: string; // Optional, as it may not always be present
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    userType: UserType;
    image?: string | null; // Optional, as it may not always be present
    name?: string; // Optional, as it may not always be present
  }
}
