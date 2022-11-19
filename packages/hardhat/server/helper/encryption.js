const crypto = require("crypto");

const generatePubPrivKeys = async () => {
  //   return crypto.generateKeyPairSync("rsa", {
  //     // The standard secure default length for RSA keys is 2048 bits
  //     modulusLength: 2048,
  //   });

  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
      cipher: "aes-256-cbc",
      passphrase: "top secret",
    },
  });

  return { publicKey, privateKey };
};

const encryptData = async (pubKey, data) => {
  const encryptedData = crypto.publicEncrypt(
    {
      key: pubKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    // We convert the data string to a buffer using `Buffer.from`
    Buffer.from(data)
  );

  const encryptedDataStr = encryptedData.toString("base64");
  return encryptedDataStr;
};

const decryptData = async (privKey, encryptedData) => {
  console.log("inside decryptData privKey: ", privKey);
  console.log("inside decryptData encryptedData: ", encryptedData);

  const decryptedData = crypto.privateDecrypt(
    {
      key: privKey,
      passphrase: "top secret",
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(encryptedData, "base64")
  );

  const decryptedDataStr = decryptedData.toString();
  return decryptedDataStr;
};

module.exports = { generatePubPrivKeys, encryptData, decryptData };
