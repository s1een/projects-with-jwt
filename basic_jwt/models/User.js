const { Schema, model } = require("mongoose");

const User = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: [
    {
      type: String,
      // link to Roles model
      ref: "Role",
    },
  ],
});

module.exports = model("User", User);
