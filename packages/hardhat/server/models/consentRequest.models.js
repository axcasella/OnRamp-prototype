const mongoose = require("mongoose");

const ConsentRequests = new mongoose.Schema(
  {
    walletAddress: { type: String, required: true, unique: true },
    consentRequests: { type: Array, required: true },
  },
  { collection: "consent-requests" }
);

const model = mongoose.model("ConsentRequests", ConsentRequests);

module.exports = model;
