import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { timingSafeEqual } from "node:crypto";
import { authConfig } from "@/auth.config";
import { OPERATOR } from "@/lib/constants";
import { prisma } from "@/lib/db";

function credentialString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return credentialString(value[0]);
  return "";
}

function passwordsMatch(provided: string, expected: string) {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Console",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentialString(credentials?.email).trim().toLowerCase();
        const password = credentialString(credentials?.password);
        const expected =
          process.env.CONSOLE_PASSWORD ?? (process.env.NODE_ENV === "production" ? "" : "kora-ops");
        if (!email || !password || !expected) return null;
        if (!passwordsMatch(password, expected)) return null;

        try {
          const member = await prisma.teamMember.findUnique({ where: { email } });
          if (member) {
            return {
              id: member.id,
              name: member.name,
              email: member.email,
              role: member.role,
            };
          }
        } catch {
          /* DB can be down during local boot; the shared console password is still enough. */
        }

        return {
          id: email,
          name: OPERATOR.name,
          email,
          role: OPERATOR.role,
        };
      },
    }),
  ],
});
