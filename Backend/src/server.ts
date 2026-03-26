import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import db from "./drizzle/db";
import { sql } from "drizzle-orm";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function startServer() {
  try {
    console.log("Starting server...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL);

    console.log("Connecting to database...");
    await db.execute(sql`SELECT 1`);

    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error);
    process.exit(1);
  }
}

startServer();