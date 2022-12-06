const express = require("express");

const app = express();
const cors = require("cors");

const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
const EnterpriseUserRegistration = require("./models/enterpriseUser.models");
const OnboardUserWithKYC = require("./models/onboardUserWithKYC.models");
const UserKeys = require("./models/userKeys.models");
const UserConsent = require("./models/userConsent.models");
const ConsentRequests = require("./models/consentRequest.models");

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

const { arrayRemove } = require("./helper/utils.js");

const { mintKYCBadgeNFT } = require("../mint/mint_nft.js");

app.post("/api/registerEnterpriseUser", async (req, res) => {
  try {
    await EnterpriseUserRegistration.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
      org: req.body.org,
    });
    res.json({ status: "ok" });
  } catch (err) {
    console.error("User registration error ", err);
    res.json({ status: "user registration failed" });
  }
});

app.post("/api/loginEnterpriseUser", async (req, res) => {
  const user = await EnterpriseUserRegistration.findOne({
    email: req.body.email,
    password: req.body.password,
  });

  if (user) {
    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
        org: user.org,
        role: user.role,
      },
      "secret123"
    );
    res.json({ status: "ok", user: token });
  } else {
    res.json({ status: "error", user: false });
  }
});

app.post("/api/onboardUserWithKYC", async (req, res) => {
  const { publicKey, privateKey } = await generatePubPrivKeys();

  if (publicKey && privateKey) {
    try {
      const createdKeys = await UserKeys.create({
        walletAddress: req.body.walletAddress,
        publicKey: JSON.stringify(publicKey),
        privateKey: JSON.stringify(privateKey),
      });

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
          consentedOrgs: [],
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
    try {
      const userData = await OnboardUserWithKYC.findOne({
        walletAddress: req.params.walletAddress,
      });

      if (userData) {
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

      const priv = JSON.parse(keyObj.privateKey);

      if (userData && priv) {
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
          consentedOrgs: userData.consentedOrgs,
        };

        res.status(200).send(decryptedData);
      }
    } catch (err) {
      console.error("Failed to get user KYC data ", err);
      res.json({ status: "Failed to get user KYC data" });
    }
  }
);

app.get(`/api/getAllWalletUsers`, async (req, res) => {
  try {
    const users = await OnboardUserWithKYC.find({});

    if (users) {
      res.status(200).send(users);
    }
  } catch (err) {
    console.error("Failed to get all users ", err);
    res.json({ status: "Failed to get all users" });
  }
});

app.post("/api/mint_kyc_nft", async (req, res) => {
  try {
    const result = await mintKYCBadgeNFT(
      req.body.walletAddress,
      req.body.country
    );
    console.log("mint api result: ", result);

    if (result.status === true) {
      return res.json({ status: "minted" });
    }

    res.json({ status: result.msg });
  } catch (err) {
    console.error("Mint NFT error ", err);
    res.json({ status: "Mint NFT failed" });
  }
});

app.post("/api/addConsent", async (req, res) => {
  try {
    const walletAdress = req.body.walletAddress;
    const org = req.body.org;

    await UserConsent.create({
      walletAddress: walletAdress,
      org,
      consent: "full",
    });

    // remove from list of existing consent requests
    const existingConsentRequests = await ConsentRequests.findOne({
      walletAdress,
    });

    if (existingConsentRequests) {
      let tempArr = existingConsentRequests.consentRequests;
      tempArr = arrayRemove(tempArr, org);
      await ConsentRequests.findOneAndUpdate({
        walletAdress,
        consentRequests: tempArr,
      });
    } else {
      await ConsentRequests.create({
        walletAdress,
        consentRequests: [org],
      });
    }

    // add to list of consentedOrgs in user object
    let user = await OnboardUserWithKYC.findOne({
      walletAdress,
    });

    let tmpArr = user.consentedOrgs;
    tmpArr.push(org);
    user.consentedOrgs = tmpArr;
    await OnboardUserWithKYC.findOneAndUpdate(user);

    res.json({ status: "ok" });
  } catch (err) {
    console.error("Add consent error ", err);
    res.json({ status: "Add consent failed" });
  }
});

app.post("/api/requestConsent/", async (req, res) => {
  try {
    const org = req.body.org;
    const walletAddress = req.body.walletAddress;

    const existingConsentRequests = await ConsentRequests.findOne({
      walletAddress,
    });

    if (existingConsentRequests) {
      if (existingConsentRequests.consentRequests.includes(org)) {
        return res.json({ status: "already exists" });
      }

      let tempArr = existingConsentRequests.consentRequests;
      tempArr.push(org);
      await ConsentRequests.updateOne({
        walletAddress,
        consentRequests: tempArr,
      });
    } else {
      await ConsentRequests.create({
        walletAddress,
        consentRequests: [org],
      });
    }

    res.json({ status: "ok" });
  } catch (err) {
    console.error("Add consent error ", err);
    res.json({ status: "Add consent failed" });
  }
});

app.get(
  "/api/getConsentRequests/walletAddress/:walletAddress",
  async (req, res) => {
    try {
      const walletAddress = req.params.walletAddress;

      const consentRequests = await ConsentRequests.findOne({
        walletAddress,
      });

      let result = [];
      if (consentRequests) {
        result = consentRequests.consentRequests;
      }

      res.json({ status: "ok", consentRequests: result });
    } catch (err) {
      console.error("Get consent requests error ", err);
      res.json({ status: "Failed to get consent requests" });
    }
  }
);

app.listen(8000, () => {
  console.log("Node server started on port 8000");
});
