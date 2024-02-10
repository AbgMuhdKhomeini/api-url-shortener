import { query } from "express";
import pool from "../database/connection.js";

// users table
export async function createUserTable() {
  try {
    const query = `CREATE TABLE IF NOT EXISTS "Users" (
          id SERIAL PRIMARY KEY,
          username VARCHAR(120) UNIQUE,
          email TEXT UNIQUE,
          password TEXT
      );`;
    await pool.query(query);
    console.log("User table created successfully");
  } catch (error) {
    console.log(error);
  }
}

// url table

export async function createUrlTable() {
  try {
    const query = `CREATE TABLE IF NOT EXISTS "Urls" (
            id SERIAL PRIMARY KEY,
            original_url TEXT NOT NULL,
            short_url TEXT NOT NULL,
            visit_counts TEXT NOT NULL,
            user_id INTEGER REFERENCES "Users"(id)
        );`;

    await pool.query(query);

    console.log("Urls table created succesfully");
  } catch (error) {
    console.log(error);
  }
}
