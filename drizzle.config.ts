import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    token: process.env.DATABASE_AUTH_TOKEN!,
  },
});
