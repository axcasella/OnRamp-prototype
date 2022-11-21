const mongoose = require("mongoose");

const UserConsent = new mongoose.Schema(
  {
    walletAddress: { type: String, required: true, unique: true },
    org: { type: String, required: true },
    consent: { type: String, required: true },
  },
  { collection: "user-consents" }
);

const model = mongoose.model("UserConsent", UserConsent);

module.exports = model;
