const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER (new user)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashedPassword]
    );

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "User already exists or DB error" });
  }
});

// LOGIN (existing user)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "User not found,Incorrect user or password" });
    }

    const user = result.rows[0];

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, skills: user.skills, experience: user.experience, company: user.company, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// UPDATE USER DETAILS
router.put("/update", async (req, res) => {
  try {
    const { skills, experience, company, role } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    await pool.query(
      "UPDATE users SET skills = $1, experience = $2, company = $3, role = $4 WHERE id = $5",
      [skills, experience, company, role, userId]
    );

    res.json({ message: "User details updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Update failed" });
  }
});
module.exports = router;