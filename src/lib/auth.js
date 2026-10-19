import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),

  emailAndPassword: {
    enabled: true,
  },
  session: {
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60, // ৫ মিনিট
  },
},

  plugins: [admin()],
});