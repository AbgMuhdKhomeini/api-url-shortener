import pool from "../database/connection.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// register new user
export async function registerNewUser(req, res) {
  try {
    const reqBody = req.body;

    // check if email, username and password provided
    if (!reqBody.email || !reqBody.username || !reqBody.password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // check if email already exist
    const queryCheckEmail = `SELECT * FROM "Users" WHERE email = $1`;
    const checkEmail = await pool.query(queryCheckEmail, [reqBody.email]);

    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ message: "Email already exist" });
    }

    // check if username already exist
    const queryCheckUsername = `SELECT * FROM "Users" WHERE username = $1`;
    const checkUsername = await pool.query(queryCheckUsername, [
      reqBody.username,
    ]);

    if (checkUsername.rows.length > 0) {
      return res.status(400).json({ message: "Username already exist" });
    }

    // create hash of password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(reqBody.password, salt);

    const query = `INSERT INTO "Users" (username, email, "password")
      VALUES ($1, $2, $3);`;

    const values = [reqBody.username, reqBody.email, hashedPassword];

    await pool.query(query, values);
    const apiResponse = {
      message: "Successfully register. Continue to login",
    };

    res.status(200).json(apiResponse);
  } catch (error) {
    res.status(500).json(error);
  }
}

// login
export async function userLogin(req, res) {
  try {
    const reqBody = req.body;

    const query = `SELECT * FROM "Users" WHERE email=$1;`;
    const values = [reqBody.email];
    const response = await pool.query(query, values);

    //if email not exist return 404
    if (response.rowCount === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    // compare using hashed password
    const isPasswordCorrect = await bcrypt.compare(
      reqBody.password,
      response.rows[0].password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Password incorrect" });
    }

    // if password match, create token
    const userData = {
      id: response.rows[0].id,
      username: response.rows[0].username,
      email: response.rows[0].email,
    };
    const token = jwt.sign(userData, "d7OVOzUBg0");

    const apiResponse = {
      message: `Login Successful. Welcome to the url shortener app ${response.rows[0].username}`,
      user: {
        id: response.rows[0].id,
        username: response.rows[0].username,
        email: response.rows[0].email,
      },
      token: token,
    };
    res.status(200).json(apiResponse);
  } catch (error) {
    res.status(500).json(error);
  }
}
