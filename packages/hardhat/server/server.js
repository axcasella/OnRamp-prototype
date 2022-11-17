// import express from "express";
const express = require("express");

const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

const { mintKYCBadgeNFT } = require("../mint/mint_nft.js");

app.post("/api/register", (req, res) => {
  console.log(req.body);
  res.json({ status: "ok" });
});

app.get("/api/get", async (req, res) => {
  let address = "0x943468B770449bFc6B9fF168A428fBB45BF644f5";
  await mintKYCBadgeNFT(address);
  res.json({ status: ["minted"] });
});

app.listen(8000, () => {
  console.log("Node server started on port 8000");
});
