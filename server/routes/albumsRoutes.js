// Handles all CRUD routes for albums
// All routes are protected — requires a valid JWT
// All queries are scoped to the authenticated user's ID

const express = require("express");
const router = express.Router();
const db = require("../db");
const upload = require("../storage");
const authMiddleware = require("../authMiddleware");

// GET /albums
// Returns all albums for the logged-in user
router.get("/", authMiddleware, (req, res) => {
    const sql = `
        SELECT albums.*, artists.name AS artist_name
        FROM albums
        JOIN artists ON albums.artist_id = artists.id
        WHERE albums.user_id = ?
    `;

    db.query(sql, [req.userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error fetching albums" });
        }
        res.json(results);
    });
});

// GET /albums/:id
// Returns a single album by ID — only if it belongs to the logged-in user
router.get("/:id", authMiddleware, (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT albums.*, artists.name AS artist_name, artists.id AS artist_id
        FROM albums
        JOIN artists ON albums.artist_id = artists.id
        WHERE albums.id = ? AND albums.user_id = ?
    `;

    db.query(sql, [id, req.userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error fetching album" });
        }
        if (!results[0]) {
            return res.status(404).json({ error: "Album not found" });
        }
        res.json(results[0]);
    });
});

// POST /albums
// Creates a new album belonging to the logged-in user
router.post("/", authMiddleware, upload.single("image"), (req, res) => {
    const { title, artist_id, year, spotify_id, image_url } = req.body;

    const image_filename = req.file ? req.file.filename : null;

    const sql = `
        INSERT INTO albums (title, image_filename, image_url, year, artist_id, user_id, spotify_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [title, image_filename, image_url, year, artist_id, req.userId, spotify_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error creating album" });
        }
        res.status(201).json({ message: "Album added successfully", albumId: results.insertId });
    });
});

// PUT /albums/:id
// Updates an album — only if it belongs to the logged-in user
router.put("/:id", authMiddleware, (req, res) => {
    const { id } = req.params;
    const { title, artist_id, year } = req.body;

    const sql = "UPDATE albums SET title = ?, artist_id = ?, year = ? WHERE id = ? AND user_id = ? LIMIT 1";

    db.query(sql, [title, artist_id, year, id, req.userId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error updating album" });
        }
        res.json({ message: "Album updated successfully" });
    });
});

// DELETE /albums/:id
// Deletes an album — only if it belongs to the logged-in user
router.delete("/:id", authMiddleware, (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM albums WHERE id = ? AND user_id = ? LIMIT 1";

    db.query(sql, [id, req.userId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error deleting album" });
        }
        res.json({ message: "Album deleted successfully" });
    });
});

module.exports = router;
