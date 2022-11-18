const express = require("express");

const app = express();
const cors = require("cors");

const mongoose = require("mongoose");
const UserRegistration = require("./models/user.models");

app.use(cors());
app.use(express.json());

const mongoURI =
  "mongodb+srv://admin:pass0@onramp-prototype.nczmpae.mongodb.net/?retryWrites=true&w=majority";
const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.error(err);
  }
};

connectToMongo();

const { mintKYCBadgeNFT } = require("../mint/mint_nft.js");

app.post("/api/register", async (req, res) => {
  console.log(req.body);
  try {
    const user = await UserRegistration.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
    });
    res.json({ status: "user registered" });
  } catch (err) {
    console.error("User registration error ", err);
    res.json({ status: "user registration failed" });
  }
});

app.post("/api/login", async (req, res) => {
  const user = await UserRegistration.findOne({
    email: req.body.email,
    password: req.body.password,
  });

  if (user) {
    res.json({ status: "ok", user: true });
  } else {
    res.json({ status: "error", user: false });
  }
});

app.post("/api/mint_kyc_nft", async (req, res) => {
  let address = "0x943468B770449bFc6B9fF168A428fBB45BF644f5";
  await mintKYCBadgeNFT(address);
  res.json({ status: "minted" });
});

app.listen(8000, () => {
  console.log("Node server started on port 8000");
});
