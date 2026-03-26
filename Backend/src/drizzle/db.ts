import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize Drizzle with schema
const db = drizzle(pool, {
  schema,
  logger: true, // set to false in production
});

export default db;