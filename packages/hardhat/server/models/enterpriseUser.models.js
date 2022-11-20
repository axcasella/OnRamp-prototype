const mongoose = require("mongoose");

const EnterpriseUserRegistration = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    org: { type: String, required: true },
  },
  { collection: "user-registration-data" }
);

const model = mongoose.model(
  "EnterpriseUserRegistration",
  EnterpriseUserRegistration
);

module.exports = model;
