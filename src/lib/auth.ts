import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { comparePassword } from "@/lib/hash";
import { NextAuthOptions } from "next-auth";
import { sendSuccessAuthenticationMail } from "@/helper/send_Successful_Auth_Mail";
import { UserType } from "@prisma/client";

// Utility function to get effective user type
export async function getEffectiveUserType(email: string): Promise<UserType> {
  try {
    // First, check UserDetails table
    const userDetails = await prisma.userDetails.findUnique({
      where: { email },
    });

    if (userDetails) {
      return userDetails.userType;
    }

    // If not found in UserDetails, check User table
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      return user.userType;
    }

    // Default to AUTHOR if no record exists
    return UserType.AUTHOR;
  } catch (error) {
    console.error("Error fetching effective user type:", error);
    return UserType.AUTHOR;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials.password) {
            console.log("Missing email or password in credentials");
            return null;
          }

          console.log("Attempting login for:", credentials.email);

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log("User not found:", credentials.email);
            return null;
          }

          if (!user.password) {
            console.log("User has no password (OAuth user?):", credentials.email);
            return null;
          }

          const isValid = await comparePassword(
            credentials.password,
            user.password
          );
          
          if (!isValid) {
            console.log("Invalid password for:", credentials.email);
            return null;
          }

          if (!user.isVerified) {
            console.log("User not verified:", credentials.email);
            return null;
          }

          // Get the effective userType
          const finalUserType = await getEffectiveUserType(credentials.email);

          // Sync userType to main user table if it differs
          if (user.userType !== finalUserType) {
            await prisma.user.update({
              where: { email: credentials.email },
              data: {
                userType: finalUserType,
                variableUserType: finalUserType, // Ensure variableUserType is also updated
              },
            });
          }
          
          console.log("User logged in successfully:", user.email, "with userType:", finalUserType, "ID:", user.id);
          await sendSuccessAuthenticationMail({email: user.email, name: user.name});

          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            userType: finalUserType,
            variableUserType: finalUserType,
            image: user.profileImage || null,
          };
        } catch (error) {
          console.error("Credentials authorization error:", error);
          return null;
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: {
        timeout: 10000,
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
      try {
        if (user && account?.provider === "google") {
          console.log("Google authentication started for:", user.email);
          
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
                isVerified: true,
                password: null,
                profileImage: user.image,
                userType: resolvedUserType,
                variableUserType: resolvedUserType,
              },
            });
            console.log("Created new Google user:", currentUser.email, "ID:", currentUser.id);
          } else {
            // Update existing user, sync userType from UserDetails if needed
            currentUser = await prisma.user.update({
              where: { email: user.email! },
              data: {
                name: user.name?.trim() || "Unnamed",
                isVerified: true,
                profileImage: user.image,
                userType: resolvedUserType,
                variableUserType: resolvedUserType,
              },
            });
            console.log("Updated existing Google user:", currentUser.email, "ID:", currentUser.id);
          }
          
          console.log("User signed in with Google:", currentUser.email, "with userType:", currentUser.userType, "ID:", currentUser.id);
          await sendSuccessAuthenticationMail({email: currentUser.email, name: currentUser.name});

          // Ensure ID is stored as string
          token.id = String(currentUser.id);
          token.email = currentUser.email;
          token.name = currentUser.name;
          token.userType = currentUser.userType;
          token.variableUserType = currentUser.variableUserType;
          token.image = user.image || null;
        }

        // For credentials login
        if (user && account?.provider === "credentials") {
          console.log("Credentials authentication for:", user.email, "ID:", user.id);
          // Ensure ID is stored as string
          token.id = String(user.id);
          token.email = user.email;
          token.name = user.name;
          token.userType = user.userType;
          token.image = user.image || null;
          token.variableUserType = user.variableUserType; // For credentials, variableUserType matches userType
        }

        // On subsequent requests, refresh variableUserType to get latest role switches
        if (token.id && !user) {
          try {
            const currentUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: { variableUserType: true }
            });
            if (currentUser) {
              token.variableUserType = currentUser.variableUserType;
            }
          } catch (error) {
            console.error("Error refreshing variableUserType:", error);
            // Continue with existing token if refresh fails
          }
        }

        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        return token;
      }
    },

    async session({ session, token }) {
      try {
        console.log("Session callback - token ID:", token.id, "email:", token.email);
        return {
          ...session,
          user: {
            id: String(token.id),
            email: token.email,
            name: token.name,
            image: token.image || null,
            userType: token.userType,
            variableUserType: token.variableUserType,
          },
        };
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },
  },

  pages: {
    signIn: "/signin",
    error: "/signin",
    signOut: "/signup",
  },

  secret: process.env.NEXTAUTH_SECRET,
};