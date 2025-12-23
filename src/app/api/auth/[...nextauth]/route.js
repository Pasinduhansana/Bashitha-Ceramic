import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const pool = getDb();

          // Ensure roles table exists
          await pool.execute(`
            CREATE TABLE IF NOT EXISTS roles (
              id INT PRIMARY KEY AUTO_INCREMENT,
              role_name VARCHAR(100) NOT NULL,
              description VARCHAR(255)
            )
          `);

          // Ensure default role exists
          const [existingRole] = await pool.execute("SELECT id FROM roles WHERE id = 1 LIMIT 1");
          if (!existingRole || existingRole.length === 0) {
            await pool.execute("INSERT INTO roles (id, role_name, description) VALUES (?, ?, ?)", [1, "default user", "Default user access"]);
          }

          // Check if user exists by email
          const [existingUser] = await pool.execute("SELECT id, username FROM users WHERE email = ? LIMIT 1", [user.email]);

          if (existingUser && existingUser.length > 0) {
            // User exists, return true to sign in
            return true;
          }

          // User doesn't exist, create new user
          // Extract first name from Google profile name
          const firstName = profile?.name ? profile.name.split(" ")[0] : user.name?.split(" ")[0] || "User";
          const username = firstName.toLowerCase();

          // Generate a dummy password hash for OAuth users (won't be used for login)
          const dummyPassword = Math.random().toString(36).slice(-8);
          const hash = await bcrypt.hash(dummyPassword, 10);

          await pool.execute("INSERT INTO users (name, username, email, password_hash, role_id, is_active) VALUES (?, ?, ?, ?, ?, ?)", [
            profile?.name || user.name || "User",
            username,
            user.email,
            hash,
            1,
            1,
          ]);

          return true;
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      }
      return false;
    },
    async jwt({ token, account, user, profile }) {
      if (account) {
        token.provider = account.provider;
        token.accessToken = account.access_token;
      }
      if (user) {
        token.email = user.email;
        token.name = user.name;
      }
      if (profile) {
        token.picture = profile.picture || user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.provider = token.provider;
        session.user.picture = token.picture;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after successful sign-in
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  events: {
    async signIn({ user, account }) {
      console.log(`User ${user.email} signed in via ${account?.provider}`);
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
