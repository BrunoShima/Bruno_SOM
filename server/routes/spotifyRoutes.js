// Handles Spotify OAuth flow and album search

const express = require("express");
const router = express.Router();
const authMiddleware = require("../authMiddleware");

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

// GET /spotify/login
// Redirects the user to Spotify's OAuth authorization page
router.get("/login", (req, res) => {
    const scopes = [
        "streaming",
        "user-read-email",
        "user-read-private",
        "user-read-playback-state",
        "user-modify-playback-state",
    ].join(" ");

    const authUrl = new URL("https://accounts.spotify.com/authorize");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", SPOTIFY_CLIENT_ID);
    authUrl.searchParams.set("scope", scopes);
    authUrl.searchParams.set("redirect_uri", SPOTIFY_REDIRECT_URI);

    res.redirect(authUrl.toString());
});

// GET /spotify/callback
// Spotify redirects here after the user authorizes
// Exchanges the code for access and refresh tokens
router.get("/callback", async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ error: "No authorization code provided" });
    }

    try {
        const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");

        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: SPOTIFY_REDIRECT_URI,
            }),
        });

        const data = await response.json();

        if (data.error) {
            return res.status(400).json({ error: data.error_description });
        }

        // Redirect to the frontend with the tokens in the URL
        // The frontend will grab these and store them
        const frontendUrl = new URL("http://localhost:5173/spotify-callback");
        frontendUrl.searchParams.set("access_token", data.access_token);
        frontendUrl.searchParams.set("refresh_token", data.refresh_token);
        frontendUrl.searchParams.set("expires_in", data.expires_in);

        res.redirect(frontendUrl.toString());
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to exchange token" });
    }
});

// GET /spotify/refresh
// Exchanges a refresh token for a new access token
router.get("/refresh", async (req, res) => {
    const { refresh_token } = req.query;

    if (!refresh_token) {
        return res.status(400).json({ error: "No refresh token provided" });
    }

    try {
        const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");

        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token,
            }),
        });

        const data = await response.json();

        if (data.error) {
            return res.status(400).json({ error: data.error_description });
        }

        res.json({
            access_token: data.access_token,
            expires_in: data.expires_in,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to refresh token" });
    }
});

// GET /spotify/search?q=query
// Searches Spotify for albums matching the query
router.get("/search", authMiddleware, async (req, res) => {
    const { q } = req.query;
    const { spotify_token } = req.headers;

    if (!q) {
        return res.status(400).json({ error: "Search query required" });
    }

    if (!spotify_token) {
        return res.status(401).json({ error: "Spotify token required" });
    }

    try {
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=album&limit=10`,
            {
                headers: {
                    Authorization: `Bearer ${spotify_token}`,
                },
            }
        );

        const data = await response.json();

        if (data.error) {
            return res.status(data.error.status).json({ error: data.error.message });
        }

        // Shape the response to only what we need on the frontend
        const albums = data.albums.items.map((album) => ({
            spotify_id: album.id,
            title: album.name,
            artist_name: album.artists[0].name,
            year: album.release_date.split("-")[0],
            image_url: album.images.sort((a, b) => b.width - a.width)[0]?.url || null,
            uri: album.uri,
        }));

        res.json(albums);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Spotify search failed" });
    }
});

module.exports = router;