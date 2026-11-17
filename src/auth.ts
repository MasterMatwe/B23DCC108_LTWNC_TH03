import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { USERS } from "@/data/users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      authorize(credentials) {
        if (
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        )
          return null;

        const email = credentials.email.trim().toLowerCase();
        const user = USERS.find(
          (item) =>
            item.email === email && item.password === credentials.password,
        );
        if (!user) return null;

        // Never put the sample password into the JWT or client session.
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
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      if (token.role !== "student" && token.role !== "admin") {
        throw new Error("Phiên đăng nhập không hợp lệ");
      }
      session.user.id = token.sub ?? "";
      session.user.role = token.role;
      return session;
    },
  },
});
