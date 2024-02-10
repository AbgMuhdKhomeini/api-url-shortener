// connection to database

import pkg from "pg";
const { Pool } = pkg;
import "dotenv/config";

const pool = new Pool({
  host: process.env.HOST,
  user: process.env.USER,
  database: process.env.DATABASE,
  port: process.env.PORT,
  password: process.env.PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function checkConnection() {
  try {
    // resolve promise
    const client = await pool.connect();
    const response = await pool.query("SELECT NOW()");
    const time = new Date(response.rows[0].now);
    console.log(`Connected to ${client.database} at ${time}`);
  } catch (error) {
    // rejected promise
    console.log("Could not connect to database", error);
  }
}

export default pool;