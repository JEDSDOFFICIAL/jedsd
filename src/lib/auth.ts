import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { comparePassword } from "@/utils/hash";
import { NextAuthOptions } from "next-auth";

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

        const userDetails = await prisma.userDetails.findUnique({
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

        return {
          id: user.id,
          email: user.email,
          userType: userDetails?.userType || "STUDENT",
          name: user.name,
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
        let newUser;
        const existingUserDetails = await prisma.userDetails.findUnique({
          where: { email: user.email! },
        });

        if (!existingUserDetails) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });
          if (!existingUser) {
            newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name?.toLowerCase().trim() || "Unnamed",
                isVerified: true, // Assuming Google logins are verified by default
                profileImage: user.image,
              },
            });
          } else {
            // User exists in 'User' table
            token.id = existingUser.id;
            token.userType = existingUser.userType;
            // Ensure name and email are updated from Google if they changed
            token.email = user.email!;
            token.name = user.name!;
          }
        }
        else{
           const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });
          if (!existingUser) {
            newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name?.toLowerCase().trim() || "Unnamed",
                userType: existingUserDetails.userType,
                isVerified: true, // Assuming Google logins are verified by default
                profileImage: user.image,
              },
            });
          } else {
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                name: user.name?.toLowerCase().trim() || "Unnamed",
                userType: existingUserDetails.userType,
                isVerified: true, // Assuming Google logins are verified by default
                profileImage: user.image,
              },
            })
            // User exists in 'User' table
            token.id = existingUser.id;
            token.userType = existingUser.userType;
            // Ensure name and email are updated from Google if they changed
            token.email = user.email!;
            token.name = user.name!;
          }

        }
      }

      if (user && account?.provider === "credentials") {
        token.id = user.id;
        token.email = user.email;
        token.userType = user.userType;
        token.name = user.name;
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
