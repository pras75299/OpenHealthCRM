import { prisma } from "@/lib/prisma";
import { verifyPasswordHash } from "@/lib/password";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

type AuthenticatedUser = {
  id: string;
  email: string;
  name: string | null;
  organizationId: string;
  roles: string[];
};

function isDevelopmentPlaceholderPassword(
  storedPassword: string | null,
  candidatePassword: string,
) {
  return (
    process.env.NODE_ENV !== "production" &&
    storedPassword === "hashed_password_placeholder" &&
    candidatePassword === "admin123"
  );
}

function isPasswordValid(
  storedPassword: string | null,
  candidatePassword: string,
) {
  return (
    verifyPasswordHash(storedPassword, candidatePassword) ||
    isDevelopmentPlaceholderPassword(storedPassword, candidatePassword)
  );
}

async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthenticatedUser | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user || !user.organizationId || !isPasswordValid(user.passwordHash, password)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    organizationId: user.organizationId,
    roles: user.userRoles.map(
      (entry: { role: { name: string } }) => entry.role.name,
    ),
  };
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        return authenticateUser(email, password);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.organizationId = user.organizationId;
        token.roles = user.roles;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.organizationId = token.organizationId ?? "";
        session.user.roles = token.roles ?? [];
      }

      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}
