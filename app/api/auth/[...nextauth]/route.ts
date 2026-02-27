import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const baseAdapter = PrismaAdapter(prisma);

export const authOptions = {
  adapter: {
    ...baseAdapter,
    getUser: (id: string) => baseAdapter.getUser!(Number(id) as any),
    updateUser: (user: any) => baseAdapter.updateUser!({ ...user, id: Number(user.id) } as any),
    linkAccount: (account: any) => baseAdapter.linkAccount!({ ...account, userId: Number(account.userId) } as any),
    createSession: (session: any) => baseAdapter.createSession!({ ...session, userId: Number(session.userId) } as any),
    updateSession: (session: any) => baseAdapter.updateSession!({ ...session, userId: session.userId ? Number(session.userId) : undefined } as any),
  },

  session: {
    strategy: "jwt" as const,
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          fullName: profile.name,
          role: "patient", // Default role for new Google users
          verificationStatus: "Pending", // Default status
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required");
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }

        // Validate password
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) {
          throw new Error("Invalid credentials");
        }

        // IMPORTANT: convert id to string
        return {
          id: user.id.toString(),
          name: user.fullName,
          email: user.email,
          role: user.role,
          verificationStatus: user.verificationStatus,
          fullName: user.fullName,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.verificationStatus = user.verificationStatus;
      }
      return token;
    },

    async session({
      session,
      token,
    }: {
      session: any;
      token: any;
    }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.verificationStatus = token.verificationStatus;

      return session;
    },
  },


  pages: {
    signIn: "/auth/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
