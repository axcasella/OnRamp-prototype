const express = require("express");

const app = express();
const cors = require("cors");

const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
const UserRegistration = require("./models/user.models");
const OnboardUserWithKYC = require("./models/onboardUserWithKYC.models");

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

app.post("/api/registerEnterpriseUser", async (req, res) => {
  console.log(req.body);
  try {
    await UserRegistration.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
    });
    res.json({ status: "ok" });
  } catch (err) {
    console.error("User registration error ", err);
    res.json({ status: "user registration failed" });
  }
});

app.post("/api/loginEnterpriseUser", async (req, res) => {
  const user = await UserRegistration.findOne({
    email: req.body.email,
    password: req.body.password,
  });

  if (user) {
    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
      },
      "secret123"
    );
    res.json({ status: "ok", user: token });
  } else {
    res.json({ status: "error", user: false });
  }
});

app.post("/api/onboardUserWithKYC", async (req, res) => {
  console.log(req.body);
  try {
    await OnboardUserWithKYC.create({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      birthdate: req.body.birthdate,
      country: req.body.country,
      address: req.body.address,
      state: req.body.state,
      city: req.body.city,
      zip: req.body.zip,
      ssn: req.body.ssn,
      phone: req.body.phone,
      walletAddress: req.body.walletAddress,
    });
    res.json({ status: "ok" });
  } catch (err) {
    console.error("User registration error ", err);
    res.json({ status: "user registration failed" });
  }
});

app.get(`/api/getMyKYCData/walletAddress/:walletAddress`, async (req, res) => {
  try {
    const userData = await OnboardUserWithKYC.findOne({
      walletAddress: req.params.walletAddress,
    });

    if (userData) {
      console.log("Found: ", userData);

      res.status(200).send(userData);
    }
  } catch (err) {
    console.error("Failed to get user KYC data ", err);
    res.json({ status: "Failed to get user KYC data" });
  }
});

app.post("/api/mint_kyc_nft", async (req, res) => {
  console.log("Wallet: ", req.body.walletAddress);
  try {
    await mintKYCBadgeNFT(req.body.walletAddress);
    res.json({ status: "minted" });
  } catch (err) {
    console.error("Mint NFT error ", err);
    res.json({ status: "Mint NFT failed" });
  }
});

app.listen(8000, () => {
  console.log("Node server started on port 8000");
});
