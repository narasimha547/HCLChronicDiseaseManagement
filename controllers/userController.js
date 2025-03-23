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


module.exports = { addPatient, addDoctor, addProvider, addPatientHistory };
