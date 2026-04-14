// Handles routes for artists
// Artists are their own table and get referenced by albums via foreign key

const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /artists
// Returns all artists, used to populate dropdowns in the frontend
router.get("/", (req, res) => {
    const sql = "SELECT * FROM artists";

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

// POST /artists
// Adds a new artist to the database
// Returns the new artist's ID so the frontend can immediately link an album to it
router.post("/", (req, res) => {
    const { name } = req.body;

    const sql = "INSERT INTO artists (name) VALUES (?)";

    db.query(sql, [name], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        res.status(201).json({
            artistId: results.insertId,
            message: "Artist added successfully",
        });
    });
});

module.exports = router;