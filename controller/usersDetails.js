import pool from "../database/connection.js";

// get users details
async function viewDetails(req, res) {
  try {
    const authData = req.user;
    const query = `SELECT * FROM "Users" WHERE id = $1;`;
    const values = [authData.id];
    const response = await pool.query(query, values);
    return res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json(error);
  }
}

// update users details
async function updateDetails(req, res) {
  try {
    const userid = req.params.id;
    const username = req.body.username;
    const email = req.body.email;
    const authData = req.user;

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

    // validate if username or email are empty
    if (!username || !email) {
      return res.status(400).json({ message: "username or email is empty" });
    }

    // validate if id is exist in database or not
    const querycheckId = `SELECT * FROM "Users" WHERE id=$1`;
    const checkId = await pool.query(querycheckId, [userid]);

    if (checkId.rowCount === 0) {
      return res.status(400).json({ message: `id ${userid} is not exist` });
    }

    // validate if the user details is belong to the user
    const queryconfirmUser = `SELECT * FROM "Users" WHERE id=$1 AND id=$2`;
    const confirmUsers = await pool.query(queryconfirmUser, [
      userid,
      authData.id,
    ]);

    if (confirmUsers.rowCount === 0) {
      return res.status(400).json({
        message: `You are not authorized to update user details with id ${userid}`,
      });
    }

    // update users details
    const query = `UPDATE "Users" SET username = $1, email = $2 WHERE id = $3`;
    const values = [username, email, userid];

    await pool.query(query, values);
    return res.json({
      message: `User with id ${userid} has been updated`,
      data: {
        username: username,
        email: email,
      },
    });
  } catch (error) {
    res.status(500).json(error);
  }
}

const usersDetails = {
  view: viewDetails,
  update: updateDetails,
};

export default usersDetails;
