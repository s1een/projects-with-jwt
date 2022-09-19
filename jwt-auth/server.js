const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const PORT = 3000;
const app = express();
app.use(express.json());

const posts = [
  {
    username: "Dmitry",
    title: "POST 1",
  },
  {
    username: "Dmitry",
    title: "POST 2",
  },
  {
    username: "Dmitry",
    title: "POST 3",
  },
  {
    username: "Jim",
    title: "POST 1",
  },
];

app.get("/posts", authenticateToken, (req, res) => {
  res.json(posts.filter((post) => post.username === req.user.name));
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  // Bearer TOKEN
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.listen(PORT, () => {
  console.log(`Server 1 Started`);
});
