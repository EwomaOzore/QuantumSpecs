import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "production" ? undefined : "dev-quantumspecs-auth-secret"),
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (
        pathname.startsWith("/login") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/cron") ||
        pathname === "/sitemap.xml" ||
        pathname === "/robots.txt" ||
        pathname === "/llms.txt" ||
        pathname === "/favicon.ico" ||
        pathname.startsWith("/icon") ||
        pathname.startsWith("/apple-icon") ||
        pathname.startsWith("/opengraph-image") ||
        pathname.startsWith("/twitter-image")
      ) {
        return true;
      }
      return !!auth?.user;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.role = typeof token.role === "string" ? token.role : undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
