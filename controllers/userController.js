const bcrypt = require("bcrypt");
const db = require("../models/db");
const { encryptData, decryptData } = require("../utils/cryptoUtil");

const addPatient = async (req, res) => {
  const {
    DOB,
    Name,
    Gender,
    Phone,
    Email,
    password
  } = decryptData(req.body.salt , req.body.data);

  if (
    !DOB ||
    !Name ||
    !Gender ||
    !Phone ||
    !Email ||
    !password
  ) {
    return res
      .status(400)
      .json({ error: "All required fields must be provided." });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO Patients (DOB, Name, Gender, Phone, Email, password_hash)
    VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      DOB,
      Name,
      Gender,
      Phone,
      Email,
      hashedPassword
    ];

    await db.query(query, values);

    res.status(201).json({ message: "Patient added successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Email already exists." });
    }
    res
      .status(500)
      .json({ error: "Failed to add Patient", details: error.message });
  }
};

const addDoctor = async (req, res) => {
  const {
    DOB,
    Name,
    Gender,
    Phone,
    Email,
    password
  } = decryptData(req.body.salt , req.body.data);

  if (
    !DOB ||
    !Name ||
    !Specilization ||
    !Gender ||
    !Phone ||
    !Email ||
    !password
  ) {
    return res
      .status(400)
      .json({ error: "All required fields must be provided." });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO Doctors (DOB, Name, Specilization, Gender, Phone, Email, password_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      DOB,
      Name,
      Specilization,
      Gender,
      Phone,
      Email,
      hashedPassword
    ];

    await db.query(query, values);

    res.status(201).json({ message: "Doctor added successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Email already exists." });
    }
    res
      .status(500)
      .json({ error: "Failed to add Doctor", details: error.message });
  }
};

const addProvider = async (req, res) => {
  const {
    Name,
    Phone,
    Email,
    password
  } = decryptData(req.body.salt , req.body.data);

  if (
    !Name ||
    !Phone ||
    !Email ||
    !password
  ) {
    return res
      .status(400)
      .json({ error: "All required fields must be provided." });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO Providers (Name, Phone, Email, password_hash)
    VALUES (?, ?, ?, ?)
    `;

    const values = [
      DOB,
      Name,
      Specilization,
      Gender,
      Phone,
      Email,
      hashedPassword
    ];

    await db.query(query, values);

    res.status(201).json({ message: "Provider added successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Email already exists." });
    }
    res
      .status(500)
      .json({ error: "Failed to add Provider", details: error.message });
  }
};


const addPatientHistory = async (req, res) => {
  const { patient_id, doctor_id, DiabetesBeforeBreakfast, DiabetesBeforeAfterfast, BeloodPressure, Weight, Height, Temperature, Pulse, RespiratoryRate, Symptoms, Diagnosis, Treatment, Date } = decryptData(req.body.salt , req.body.data);

  if (!patient_id || !doctor_id || !DiabetesBeforeBreakfast || !DiabetesBeforeAfterfast || !BeloodPressure || !Weight || !Height || !Temperature || !Pulse || !RespiratoryRate || !Symptoms || !Diagnosis || !Treatment || !Date) {
      return res.status(400).json({ error: "All required fields must be provided." });
  }

  try {

      const sql = `INSERT INTO PatientHistory (patient_id, doctor_id, DiabetesBeforeBreakfast, DiabetesBeforeAfterfast, BeloodPressure, Weight, Height, Temperature, Pulse, RespiratoryRate, Symptoms, Diagnosis, Treatment, Date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const values = [patient_id, doctor_id, DiabetesBeforeBreakfast, DiabetesBeforeAfterfast, BeloodPressure, Weight, Height, Temperature, Pulse, RespiratoryRate, Symptoms, Diagnosis, Treatment, Date];
      
      const [result] = await db.execute(sql, values);
      res.status(201).json({ message: "Patient history added successfully", history_id: result.insertId });
    
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Email already exists." });
    }
    res
      .status(500)
      .json({ error: "Failed to add Patient history", details: error.message });
  }
};

const login = async (req, res) => {
  const { Email, password, type } = decryptData(req.body.salt, req.body.data);

  if (!Email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    let tableName;
    if (type === 1) {
      tableName = "Doctors";
    } else if (type === 2) {
      tableName = "Patients";
    } else if (type === 3) {
      tableName = "Providers";
    } else {
      return res.status(400).json({ error: "Invalid user type." });
    }
    const query = `
      SELECT id, password_hash FROM ${tableName} WHERE Email = ?
    `;

    const [rows] = await db.query(query, [Email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    res.status(200).json({ message: "Login successful", userId: user.id });
  } catch (error) {
    res.status(500).json({ error: "Failed to login", details: error.message });
  }
};


module.exports = { addPatient, addDoctor, addProvider, login, addPatientHistory };
