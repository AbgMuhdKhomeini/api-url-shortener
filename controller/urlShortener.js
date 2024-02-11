import pool from "../database/connection.js";
import shortid from "shortid";

// create short url
async function createShortUrl(req, res) {
  try {
    const originalUrl = req.body.url;
    const authData = req.user;
    const visitCounts = 0;
    const shortUrl = shortid.generate();

    const query = `INSERT INTO "Urls" (original_url, short_url, visit_counts, user_id) VALUES ($1, $2, $3, $4) RETURNING short_url`;
    const values = [originalUrl, shortUrl, visitCounts, authData.id];
    const response = await pool.query(query, values);

    return res
      .status(200)
      .json(
        `https://api-url-shortener.onrender.com${response.rows[0].short_url}`
      );
  } catch (error) {
    return res.status(500).json(error);
  }
}

// view short url

async function viewShortUrl(req, res) {
  try {
    const shortUrl = req.params.shortUrl;

    const query = `SELECT original_url FROM "Urls" WHERE short_url = $1`;
    const values = [shortUrl];
    const response = await pool.query(query, values);

    // 404 page not found
    if (response.rows.length === 0) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    // query visit_counts from database
    const queryCount = 'SELECT visit_counts FROM "Urls" WHERE short_url=$1';
    const visitCount = await pool.query(queryCount, [shortUrl]);
    const currentCount = parseInt(visitCount.rows[0].visit_counts);

    // update counts in database
    const updatedCount = currentCount + 1;
    const queryUpdateCount = `UPDATE "Urls" SET visit_counts = $1 WHERE short_url = $2`;
    await pool.query(queryUpdateCount, [updatedCount, shortUrl]);

    return res.redirect(response.rows[0].original_url);
  } catch (error) {
    res.status(500).json(error);
  }
}

// view all user URL

async function viewAllUserUrl(req, res) {
  try {
    const authData = req.user;
    const query = `SELECT * FROM "Urls" WHERE user_id = $1;`;
    const values = [authData.id];
    const response = await pool.query(query, values);
    return res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json(error);
  }
}

// update user url

async function update(req, res) {
  try {
    const id = req.params.id;
    const originalUrl = req.body.originalUrl;
    const shortUrl = req.body.shortUrl;
    const authData = req.user;

    // validate if originalUrl or shortUrl are empty
    if (!originalUrl || !shortUrl) {
      return res
        .status(400)
        .json({ message: "originalUrl or shortUrl is empty" });
    }

    // validate if id is exist in database or not
    const querycheckUser = `SELECT * FROM "Urls" WHERE id=$1`;
    const checkId = await pool.query(querycheckUser, [id]);

    if (checkId.rowCount === 0) {
      return res
        .status(400)
        .json({ message: `urls with id ${id} is not exist` });
    }

    // validate if the urls is belong to the user
    const queryconfirmUser = `SELECT * FROM "Urls" WHERE id=$1 AND user_id=$2`;
    const confirmUsers = await pool.query(queryconfirmUser, [id, authData.id]);

    if (confirmUsers.rowCount === 0) {
      return res.status(400).json({
        message: `You are not authorized to update urls with id ${id}`,
      });
    }

    // query to update users url details
    const query = `UPDATE "Urls" SET original_url = $1, short_url = $2 WHERE id = $3`;
    const values = [originalUrl, shortUrl, id];

    await pool.query(query, values);
    return res.json({
      message: `url with id ${id} has been updated`,
      data: {
        original_Url: originalUrl,
        short_url: shortUrl,
      },
    });
  } catch (error) {
    res.status(500).json(error);
  }
}

// delete urls

async function deleteUserUrls(req, res) {
  try {
    const id = req.params.id;
    const authData = req.user;

    // validate if id is exist in database or not
    const querycheckUser = `SELECT * FROM "Urls" WHERE id=$1`;
    const checkId = await pool.query(querycheckUser, [id]);

    if (checkId.rowCount === 0) {
      return res.status(400).json({ message: `id ${id} is not exist` });
    }

    // validate if the urls is belong to the user
    const queryconfirmUser = `SELECT * FROM "Urls" WHERE id=$1 AND user_id=$2`;
    const confirmUsers = await pool.query(queryconfirmUser, [id, authData.id]);

    if (confirmUsers.rowCount === 0) {
      return res.status(400).json({
        message: `You are not authorized to delete urls with id ${id}`,
      });
    }

    // delete urls query
    const query = `DELETE FROM "Urls" WHERE id = $1;`;
    const values = [id];
    await pool.query(query, values);
    return res
      .status(200)
      .json({ message: `Urls with id ${id} has been deleted` });
  } catch (error) {
    res.status(500).json(error);
  }
}

const urlShortener = {
  create: createShortUrl,
  view: viewShortUrl,
  viewAllUserUrls: viewAllUserUrl,
  update: update,
  delete: deleteUserUrls,
};

export default urlShortener;
