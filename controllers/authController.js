require("dotenv").config();

const db = require("../models/db/mysql");
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const { encryptData, decryptData } = require("../utils/cryptoUtil");

const verifyAdmin = async (req, res, next) => {
  try {
    const partner = await db.query("SELECT * FROM partners WHERE id = ?", [
      req.partner.id,
    ]);

    if (!partner.length || !partner[0].is_admin) {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    next();
  } catch (error) {
    res
      .status(500)
      .json({ error: "Authorization failed", details: error.message });
  }
};

const generateApiKey = () => uuidv4().replace(/-/g, '');
const generateSecretKey = () => crypto.randomBytes(32).toString("hex"); 

const addPartner = async (req, res) => {
  const { companyName, email, phone, address } = req.body;

  if (!companyName || !email || !phone || !address) {
    return res.status(400).json({ error: "All details are required" });
  }

  try {
    const existingPartner = await db.query(
      "SELECT * FROM partners WHERE vcEmail = ?",
      [email]
    );

    if (existingPartner.length > 0) {
      return res
        .status(409) // HTTP 409 Conflict
        .json({ error: "Partner email already exists." });
    }
    // Generate keys
    const apiKey = generateApiKey();
    const secretKey = generateSecretKey();

    // Encrypt the secret key before saving
    const encryptedSecret = CryptoJS.AES.encrypt(
      secretKey,
      process.env.TOKEN_CRYPTO_SECRET
    ).toString();

    await db.query(
      "INSERT INTO partners (vcCompany, vcEmail, vcPhone, vcCompanyAddress, api_key, secret_key) VALUES (?, ?, ?, ?, ?, ?)",
      [companyName, email, phone, address, apiKey, secretKey]
    );

    res.json({
      message: "Partner added successfully",
      apiKey,
      secretKey,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to add partner", details: error.message });
  }
};

const generateToken = (partner) => {
  return jwt.sign(
    { id: partner.id, apiKey: partner.api_key },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const authenticatePartner = async (req, res) => {

  const { salt, data } = req.body;
  const { secretKey } = decryptData(salt,data);
  if (!secretKey) {
    return res
      .status(400)
      .json({ error: "Secret Key are required" });
  }

  try {
    const partners = await db.query(
      "SELECT * FROM partners WHERE secret_key = ?",
      [secretKey]
    );

    if (partners.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const partner = partners[0];

    if (partner.secret_key !== secretKey) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(partner);
    res.json({ token });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Authentication failed", details: error.message });
  }
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.partner = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
module.exports = { addPartner, verifyAdmin, authenticatePartner, verifyToken };
