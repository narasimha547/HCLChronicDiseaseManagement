const CryptoJS = require("crypto-js");
require("dotenv").config();

const deriveKey = (salt) => {
  return CryptoJS.PBKDF2(salt, CryptoJS.enc.Hex.parse("a1b2c3d4e5f6g7h8"), {
    keySize: 256 / 32,
    iterations: 1000,
  });
};

const encryptData = (salt, data) => {
  try {

    const key = deriveKey(salt);
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();

    return encrypted;
  } catch (error) {
    throw new Error("Failed to encrypt data");
  }
};

const decryptData = (salt, ciphertext) => {
  try {
    const key = deriveKey(salt);
    const bytes = CryptoJS.AES.decrypt(ciphertext, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });

    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedData) {
      throw new Error("Decryption resulted in an empty string. Possible wrong key.");
    }

    return JSON.parse(decryptedData);
  } catch (error) {
    throw new Error("Decryption failed. Ensure the key & ciphertext are correct.");
  }
};

module.exports = { encryptData, decryptData };
