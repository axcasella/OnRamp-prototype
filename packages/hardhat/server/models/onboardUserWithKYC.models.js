const mongoose = require("mongoose");

const OnboardUserWithKYC = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    address: { type: String, required: true },
    ssn: { type: String, required: true, unique: true },
    walletAddress: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    birthdate: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { collection: "user-kyc-data" }
);

const model = mongoose.model("OnboardUserWithKYC", OnboardUserWithKYC);

module.exports = model;
