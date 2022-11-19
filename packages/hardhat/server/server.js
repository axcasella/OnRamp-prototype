const express = require("express");

const app = express();
const cors = require("cors");

const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
const UserRegistration = require("./models/enterpriseUser.models");
const OnboardUserWithKYC = require("./models/onboardUserWithKYC.models");
const UserKeys = require("./models/userKeys.models");

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

const {
  generatePubPrivKeys,
  encryptData,
  decryptData,
} = require("./helper/encryption.js");

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

  const { publicKey, privateKey } = await generatePubPrivKeys();
  console.log("KEYS: ", publicKey, privateKey);

  if (publicKey && privateKey) {
    try {
      const createdKeys = await UserKeys.create({
        walletAddress: req.body.walletAddress,
        publicKey: JSON.stringify(publicKey),
        privateKey: JSON.stringify(privateKey),
      });

      console.log("createdKeys", createdKeys);

      if (createdKeys) {
        await OnboardUserWithKYC.create({
          firstname: await encryptData(publicKey, req.body.firstname),
          lastname: await encryptData(publicKey, req.body.lastname),
          email: await encryptData(publicKey, req.body.email),
          birthdate: await encryptData(publicKey, req.body.birthdate),
          country: await encryptData(publicKey, req.body.country),
          address: await encryptData(publicKey, req.body.address),
          state: await encryptData(publicKey, req.body.state),
          city: await encryptData(publicKey, req.body.city),
          zip: await encryptData(publicKey, req.body.zip),
          ssn: await encryptData(publicKey, req.body.ssn),
          phone: await encryptData(publicKey, req.body.phone),
          walletAddress: req.body.walletAddress,
        });
        res.json({ status: "ok" });
      }
    } catch (err) {
      console.error("User onboarding error ", err);
      res.json({ status: "user onboarding failed" });
    }
  }
});

app.get(
  `/api/getUserEncryptedKYCData/walletAddress/:walletAddress`,
  async (req, res) => {
    console.log("HERE");
    try {
      const userData = await OnboardUserWithKYC.findOne({
        walletAddress: req.params.walletAddress,
      });

      if (userData) {
        console.log("Found: ", userData);

        res.status(200).send(userData);
      }
    } catch (err) {
      console.error("Failed to get user's encrypted KYC data ", err);
      res.json({ status: "Failed to get user's encrypted KYC data" });
    }
  }
);

app.get(
  `/api/getUserDecryptedKYCData/walletAddress/:walletAddress`,
  async (req, res) => {
    try {
      const userData = await OnboardUserWithKYC.findOne({
        walletAddress: req.params.walletAddress,
      });

      const keyObj = await UserKeys.findOne({
        walletAddress: req.params.walletAddress,
      });

      console.log("Got key obj", keyObj);
      const priv = JSON.parse(keyObj.privateKey);
      console.log("Parsed private key from key obj", priv);

      if (userData && priv) {
        console.log("Found user with priv key: ", userData, priv);

        const decryptedData = {
          firstname: await decryptData(priv, userData.firstname),
          lastname: await decryptData(priv, userData.lastname),
          email: await decryptData(priv, userData.email),
          birthdate: await decryptData(priv, userData.birthdate),
          country: await decryptData(priv, userData.country),
          address: await decryptData(priv, userData.address),
          state: await decryptData(priv, userData.state),
          city: await decryptData(priv, userData.city),
          zip: await decryptData(priv, userData.zip),
          ssn: await decryptData(priv, userData.ssn),
          phone: await decryptData(priv, userData.phone),
          walletAddress: userData.walletAddress,
        };

        res.status(200).send(decryptedData);
      }
    } catch (err) {
      console.error("Failed to get user KYC data ", err);
      res.json({ status: "Failed to get user KYC data" });
    }
  }
);

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
