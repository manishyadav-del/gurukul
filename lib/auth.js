import NextAuthModule from "next-auth";
import CredentialsProviderModule from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma.js";

const NextAuth = NextAuthModule?.default || NextAuthModule;
const CredentialsProvider = CredentialsProviderModule?.default || CredentialsProviderModule;

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user) {
          return null;
        }

        // Strict password verification (rejects unhashed/guest accounts or missing passwords)
        if (!user.passwordHash || !credentials.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isPasswordValid) {
          return null;
        }

        // Enforce Email Verification: Unverified users cannot establish a session
        if (user.isEmailVerified === false) {
          const { createAndSendVerificationToken } = await import("../server/email/emailService.js");
          await createAndSendVerificationToken(user.email, user.name).catch(() => {});
          throw new Error(`EMAIL_NOT_VERIFIED:${user.email}`);
        }

        // Return user object for session
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/dashboard",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "gurukul-production-default-secret-key-32chars",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
