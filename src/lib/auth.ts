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
        if (!isValid) return null;

        if (!user.isVerified) return null;

        const userDetails = await prisma.userDetails.findUnique({ // Corrected: Assuming userDetails is on the User model
          where: { email: credentials.email },
        });

        if (userDetails) {
          await prisma.user.update({
            where: { email: credentials.email },
            data: {
              userType: userDetails.userType,
              isVerified: true,
            },
          });
        }
        await sendSuccessAuthMail(user.email, user.name);
        return {
          id: user.id,
          email: user.email,
          userType: userDetails?.userType || "STUDENT",
          name: user.name,
          image: user.profileImage || "/default-image.jpg", // Default image if not provided
          isVerified: user.isVerified || false,
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
        let currentUser; // Variable to hold the user data that will populate the token

        // Check if user details exist in the userDetails table
        const existingUserDetails = await prisma.userDetails.findUnique({
          where: { email: user.email! },
        });

        // Check if user exists in the User table
        let existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          // If user doesn't exist in the 'User' table, create them
          currentUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name?.toLowerCase().trim() || "Unnamed",
              isVerified: true, // Assuming Google logins are verified by default
              profileImage: user.image,
              userType: existingUserDetails?.userType || "USER", // Assign userType if userDetails exists, otherwise default
            },
          });
        } else {
          // If user exists, update their information from Google, especially if userDetails exists
          currentUser = await prisma.user.update({
            where: { email: user.email! },
            data: {
              name: user.name?.toLowerCase().trim() || "Unnamed",
              isVerified: true, // Assuming Google logins are verified by default
              profileImage: user.image,
              userType: existingUserDetails?.userType || existingUser.userType, // Keep existing userType or update if userDetails exists
            },
          });
        }

        // Now, populate the token with the final user data
        token.id = currentUser.id;
        token.email = currentUser.email;
        token.name = currentUser.name;
        token.userType = currentUser.userType;
        token.picture = currentUser.profileImage || "/default-image.jpg"; // Use profileImage from currentUser

        await sendSuccessAuthMail(currentUser.email, currentUser.name);
      }

      if (user && account?.provider === "credentials") {
        token.id = user.id;
        token.email = user.email;
        token.userType = user.userType;
        token.name = user.name;
        token.picture = user.image || "/default-image.jpg"; // Default image if not provided
      }

      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          userType: token.userType as string,
          image: token.picture as string || "/default-image.jpg", // Default image if not provided
        },
      };
    },
  },

  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },

  secret: process.env.NEXTAUTH_SECRET,
};