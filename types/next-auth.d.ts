import { DefaultSession, DefaultUser } from "next-auth";
import { Role, VerificationStatus } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      verificationStatus: VerificationStatus | null;
      fullName?: string;
      email?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: Role;
    verificationStatus: VerificationStatus | null;
    fullName?: string;
    email?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    verificationStatus: VerificationStatus | null;
  }
}
