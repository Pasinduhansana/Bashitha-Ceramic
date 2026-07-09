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

          const db = getDb();


          // Ensure roles table exists
          await db.execute(`
            CREATE TABLE IF NOT EXISTS roles (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              role_name TEXT NOT NULL,
              description TEXT
            )
          `);



          // Ensure default role exists
          const roleResult = await db.execute({
            sql: `
              SELECT id 
              FROM roles 
              WHERE id = ?
              LIMIT 1
            `,
            args: [1],
          });



          if (roleResult.rows.length === 0) {

            await db.execute({
              sql: `
                INSERT INTO roles
                (
                  id,
                  role_name,
                  description
                )
                VALUES (?, ?, ?)
              `,
              args: [
                1,
                "default user",
                "Default user access",
              ],
            });

          }



          // Check existing user by email
          const userResult = await db.execute({
            sql: `
              SELECT 
                id,
                username
              FROM users
              WHERE email = ?
              LIMIT 1
            `,
            args: [
              user.email,
            ],
          });



          if (userResult.rows.length > 0) {
            return true;
          }



          // Create new Google user

          const firstName =
            profile?.name
              ? profile.name.split(" ")[0]
              : user.name?.split(" ")[0] || "User";


          const username = firstName.toLowerCase();



          // Dummy password hash for OAuth accounts
          const dummyPassword =
            Math.random()
              .toString(36)
              .slice(-8);


          const hash = await bcrypt.hash(
            dummyPassword,
            10
          );



          await db.execute({
            sql: `
              INSERT INTO users
              (
                name,
                username,
                email,
                password_hash,
                role_id,
                is_active
              )
              VALUES (?, ?, ?, ?, ?, ?)
            `,
            args: [
              profile?.name || user.name || "User",
              username,
              user.email,
              hash,
              1,
              1, // Active Google users immediately
            ],
          });



          return true;


        } catch (error) {

          console.error(
            "Google sign-in error:",
            error
          );

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
        token.picture =
          profile.picture ||
          user.image;
      }


      return token;
    },



    async session({ session, token }) {

      if (session.user) {

        session.user.provider =
          token.provider;

        session.user.picture =
          token.picture;

      }


      return session;
    },



    async redirect({ url, baseUrl }) {

      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      else if (
        new URL(url).origin === baseUrl
      ) {
        return url;
      }

      return `${baseUrl}/dashboard`;

    },

  },



  pages: {
    signIn: "/login",
  },



  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },



  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },



  events: {

    async signIn({ user, account }) {

      console.log(
        `User ${user.email} signed in via ${account?.provider}`
      );

    },

  },
};



const handler = NextAuth(authOptions);

export {
  handler as GET,
  handler as POST,
};