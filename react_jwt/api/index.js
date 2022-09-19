const e = require("express");
const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const PORT = 5000;
const app = express();
app.use(express.json());

const users = [
  {
    id: "1",
    username: "Dmitry",
    password: "123123",
    isAdmin: true,
  },
  {
    id: "2",
    username: "Jane",
    password: "12312322",
    isAdmin: false,
  },
  {
    id: "3",
    username: "Bob",
    password: "123abc",
    isAdmin: false,
  },
];

let refreshTokens = [];

app.post("/api/refresh", (req, res) => {
  // take token from user
  const refreshToken = req.body.token;
  // send error if not valid
  if (!refreshToken) return res.status(401).json("You are not authentificated");
  if (!refreshTokens.includes(refreshToken))
    return res.status(403).json("Refresh token is not valid");
  jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err, payload) => {
    if (err) console.log(err);
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);
    refreshTokens.push(newRefreshToken);
    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
  // create new accessToken
});

app.get("/api/users", verify, (req, res) => {
  res.json(users);
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    // generate access token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.push(refreshToken);
    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      accessToken,
      refreshToken,
    });
  } else {
    res.status(400).json("Username or password incorrect!");
  }
});

app.post("/api/logout", verify, (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.status(200).json("You logged out successfully");
});

app.delete("/api/users/:userId", verify, (req, res) => {
  if (req.user.id === req.params.userId || req.user.isAdmin) {
    res.status(200).json("User has been deleted.");
  } else {
    res.status(403).json("You are not allowed to delete this user!");
  }
});

app.listen(PORT, () => console.log("Backend server is running on PORT:", PORT));

function verify(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, (err, payload) => {
      if (err) {
        return res.status(403).json("Token is not valid");
      }
      req.user = payload;
      next();
    });
  } else {
    res.status(401).json("You are not authentificated!");
  }
}

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    process.env.SECRET_KEY,
    {
      expiresIn: "15s",
    }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    process.env.REFRESH_SECRET_KEY
  );
}
