import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { comparePassword } from "@/lib/hash";
import { NextAuthOptions } from "next-auth";
import { sendSuccessAuthenticationMail } from "@/helper/send_Successful_Auth_Mail";
import { getEffectiveUserType } from "@/lib/userDetailsUtils";

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

        // Get the most up-to-date userType from UserDetails
        const finalUserType = await getEffectiveUserType(credentials.email);

        // Sync userType to main user table if it differs
        if (user.userType !== finalUserType) {
          await prisma.user.update({
            where: { email: credentials.email },
            data: {
              userType: finalUserType,
            },
          });
        }

        await sendSuccessAuthenticationMail(user.email, user.name);

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
      httpOptions: {
        timeout: 10000, // 10 seconds instead of default 3.5 seconds
      },
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  debug: process.env.NODE_ENV === "development",

  // Add timeout and retry configuration
  events: {
    async signIn(message) {
      console.log("Sign in event:", message);
    },
    async signOut(message) {
      console.log("Sign out event:", message);
    },
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        // Get the effective userType using utility function
        const resolvedUserType = await getEffectiveUserType(user.email!);

        let currentUser;

        if (!existingUser) {
          // Create new user with correct userType from UserDetails
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
          // Update existing user, sync userType from UserDetails if needed
          currentUser = await prisma.user.update({
            where: { email: user.email! },
            data: {
              name: user.name?.trim() || "Unnamed",
              isVerified: true,
              profileImage: user.image,
              userType: resolvedUserType, // Always sync from UserDetails
            },
          });
        }

        await sendSuccessAuthenticationMail(currentUser.email, currentUser.name);

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
    error: "/signin", // Redirect to signin page on OAuth errors
    signOut: "/signup",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
