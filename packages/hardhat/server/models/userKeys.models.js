const mongoose = require("mongoose");

const UserKeys = new mongoose.Schema(
  {
    walletAddress: { type: String, required: true, unique: true },
    publicKey: { type: String, required: true },
    privateKey: { type: String, required: true },
  },
  { collection: "user-keys" }
);

const model = mongoose.model("UserKeys", UserKeys);

module.exports = model;
