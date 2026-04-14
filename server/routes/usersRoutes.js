// Handles user registration and login

const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

// POST /users
// Creates a new user account with a hashed password
router.post(
    "/",
    [
        body("email").isEmail().withMessage("Valid email required"),
        body("password")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters")
            .matches(/[A-Z]/)
            .withMessage("Password must contain at least one uppercase letter")
            .matches(/[0-9]/)
            .withMessage("Password must contain at least one number"),
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // Check if email is already registered
            db.query("SELECT id FROM users WHERE email = ?", [email], async (err, results) => {
                if (err) return res.status(500).json({ error: "Database error" });
                if (results.length > 0) {
                    return res.status(409).json({ error: "Email already in use" });
                }

                // Hash the password before saving
                const hashedPassword = await bcrypt.hash(password, 10);

                db.query(
                    "INSERT INTO users (email, password) VALUES (?, ?)",
                    [email, hashedPassword],
                    (err, results) => {
                        if (err) return res.status(500).json({ error: "Error creating user" });
                        res.status(201).json({ message: "Account created successfully" });
                    }
                );
            });
        } catch (err) {
            res.status(500).json({ error: "Server error" });
        }
    }
);

// POST /users/signin
// Validates credentials and returns a JWT
router.post(
    "/signin",
    [
        body("email").isEmail().withMessage("Valid email required"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
                if (err) return res.status(500).json({ error: "Database error" });
                if (results.length === 0) {
                    return res.status(401).json({ error: "Invalid email or password" });
                }

                const user = results[0];

                // Compare the provided password with the stored hash
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res.status(401).json({ error: "Invalid email or password" });
                }

                // Sign and return a JWT containing the user's ID
                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                    expiresIn: "7d",
                });

                res.json({ token });
            });
        } catch (err) {
            res.status(500).json({ error: "Server error" });
        }
    }
);

module.exports = router;