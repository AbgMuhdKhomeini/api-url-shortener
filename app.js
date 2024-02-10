import dbInit from "./database/dbInit.js";
import express from "express";
import { checkHealth } from "./controller/checkHealth.js";
import { registerNewUser, userLogin } from "./controller/auth.js";
import urlShortener from "./controller/urlShortener.js";
import usersDetails from "./controller/usersDetails.js";

import bodyParser from "body-parser";
import isAuth from "./middleware/isAuth.js";

const app = express();
const PORT = 3000;

// middleware to req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// initialize database
dbInit();

// routes
app.get("/", checkHealth);
app.post("/register", registerNewUser);
app.post("/login", userLogin);
app.get("/user", isAuth, usersDetails.view);
app.put("/user/:id", isAuth, usersDetails.update);
app.post("/url", isAuth, urlShortener.create);
app.get("/viewurl", isAuth, urlShortener.viewAllUserUrls);
app.put("/updateurl/:id", isAuth, urlShortener.update);
app.delete("/deleteurl/:id", isAuth, urlShortener.delete);
app.get("/:shortUrl", urlShortener.view);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
