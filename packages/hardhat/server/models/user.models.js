const mongoose = require("mongoose");

const UserRegistration = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    quote: { type: String, required: true },
  },
  { collection: "user-registration-data" }
);

const userRegistrationModel = mongoose.model(
  "UserRegistration",
  UserRegistration
);

module.exports = { userRegistrationModel };
