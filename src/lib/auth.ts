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
          
          console.log("User logged in successfully:", user.email, "with userType:", finalUserType, "ID:", user.id);
          await sendSuccessAuthenticationMail({email: user.email, name: user.name});

          return {
            id: String(user.id), // Ensure ID is returned as string
            email: user.email,
            name: user.name,
            userType: finalUserType,
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
                userType: resolvedUserType, // Always sync from UserDetails
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
        }

        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        // Return token as-is if there's an error to prevent auth failure
        return token;
      }
    },

    async session({ session, token }) {
      try {
        console.log("Session callback - token ID:", token.id, "email:", token.email);
        return {
          ...session,
          user: {
            id: String(token.id), // Ensure ID is always a string
            email: token.email,
            name: token.name,
            image: token.image || null,
            userType: token.userType,
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
    error: "/signin", // Redirect to signin page on OAuth errors
    signOut: "/signup",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
