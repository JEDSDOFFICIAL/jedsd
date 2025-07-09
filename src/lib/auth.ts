import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { comparePassword } from "@/utils/hash";
import { NextAuthOptions } from "next-auth";
import { sendSuccessAuthMail } from "@/helper/mail/sendSuccessAuthMail";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await comparePassword(
          credentials.password,
          user.password
        );
        if (!isValid || !user.isVerified) return null;

        const userDetails = await prisma.userDetails.findUnique({
          where: { email: credentials.email },
        });

        const finalUserType =
          userDetails &&
          ["ADMIN", "REVIEWER", "EDITOR", "USER"].includes(userDetails.userType)
            ? userDetails.userType
            : "USER";

        // Sync userType to main user table
        await prisma.user.update({
          where: { email: credentials.email },
          data: {
            userType: finalUserType,
            isVerified: true,
          },
        });

        await sendSuccessAuthMail(user.email, user.name);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          userType: finalUserType,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account?.provider === "google") {
        const existingUserDetails = await prisma.userDetails.findUnique({
          where: { email: user.email! },
        });

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        const resolvedUserType =
          existingUser?.userType &&
          ["ADMIN", "REVIEWER", "EDITOR", "USER"].includes(
            existingUser.userType
          )
            ? existingUser.userType
            : existingUserDetails?.userType &&
                ["ADMIN", "REVIEWER", "EDITOR", "USER"].includes(
                  existingUserDetails.userType
                )
              ? existingUserDetails.userType
              : "USER";

        let currentUser;

        if (!existingUser) {
          currentUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name?.trim() || "Unnamed",
              username: user.email!.split("@")[0],
              isVerified: true,
              password: null,
              profileImage: user.image,
              userType: resolvedUserType,
            },
          });
        } else {
          currentUser = await prisma.user.update({
            where: { email: user.email! },
            data: {
              name: user.name?.trim() || "Unnamed",
              isVerified: true,
              profileImage: user.image,
              userType: resolvedUserType,
            },
          });
        }

        await sendSuccessAuthMail(currentUser.email, currentUser.name);

        token.id = currentUser.id;
        token.email = currentUser.email;
        token.name = currentUser.name;
        token.username = currentUser.username;
        token.userType = currentUser.userType;
        token.image = user.image || null;
      }

      // For credentials login
      if (user && account?.provider === "credentials") {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.username = user.username;
        token.userType = user.userType;
        token.image = user.image || null;
      }

      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          id: token.id,
          email: token.email,
          name: token.name,
          username: token.username,
          image: token.image || null,
          userType: token.userType,
        },
      };
    },
  },

  pages: {
    signIn: "/signin",
    error: "/auth/error",
    signOut: "/signup",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
