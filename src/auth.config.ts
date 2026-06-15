import type { NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";

export const authConfig: NextAuthConfig = {
  providers: [Discord],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname === "/login";
      const isPublic = nextUrl.pathname.startsWith("/api/auth");

      if (isPublic) return true;
      if (isLoggedIn && isLoginPage) return Response.redirect(new URL("/dashboard", nextUrl));
      if (!isLoggedIn && !isLoginPage) return Response.redirect(new URL("/login", nextUrl));
      return true;
    },
  },
};
