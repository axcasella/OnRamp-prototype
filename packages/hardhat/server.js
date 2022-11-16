// import express from "express";
const express = require("express");
const { mintKYCBadgeNFT } = require("./mint/mint_nft.js");

const app = express();

app.get("/api/get", async (req, res) => {
  let address = "0x943468B770449bFc6B9fF168A428fBB45BF644f5";
  await mintKYCBadgeNFT(address);
  res.json({ status: ["minted"] });
});

app.listen(8000, () => {
  console.log("Node server started on port 8000");
});
