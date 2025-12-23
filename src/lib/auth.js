import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// NextAuth configuration options
export const authOptions = {
  providers: [], // Add your providers here
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: JWT_SECRET,
  },
  pages: {},
  callbacks: {},
};
