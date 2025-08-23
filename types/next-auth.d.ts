import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user?: {
      role?: "ADMIN" | "HELPER" | "CLIENT";
      apiKey?: string;
    } & DefaultSession["user"];
    apiKey?: string;
  }

  interface User extends DefaultUser {
    role?: "ADMIN" | "HELPER" | "CLIENT";
    apiKey?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "HELPER" | "CLIENT";
    apiKey?: string;
  }
}
