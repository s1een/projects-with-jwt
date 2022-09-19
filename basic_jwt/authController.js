const User = require("./models/User");
const Role = require("./models/Role");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { secret } = require("./config");

function generateAccessToken(id, roles) {
  const payload = {
    id,
    roles,
  };
  return jwt.sign(payload, secret, {
    // token live time
    expiresIn: "24h",
  });
}

class authContorller {
  async registration(req, res) {
    try {
      // middleware
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: `Registration Error`, errors });
      }
      const { username, password } = req.body;
      const candidate = await User.findOne({ username });
      if (candidate) {
        return res
          .status(400)
          .json({ message: "User with same nickname already exist" });
      }
      bcrypt.genSalt(7, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
          const userRole = await Role.findOne({ value: "USER" });
          const user = new User({
            username,
            password: hash,
            roles: [userRole.value],
          });
          await user.save();
        });
      });
      return res.json({ message: "User registered successfully" });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: `Registation error` });
    }
  }
  async login(req, res) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        return res
          .status(400)
          .json({ message: `User with username ${username} is not exist` });
      }
      // password compare
      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res
          .status(400)
          .json({ message: `Password is not correct for ${username}` });
      }
      const token = generateAccessToken(user._id, user.roles);
      return res.json({ token });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: `Login error` });
    }
  }
  async getUsers(req, res) {
    try {
      const users = await User.find();
      return res.status(200).json(users);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
}

module.exports = new authContorller();
