# SOM

A personal music collection app built around the Spotify API. Save albums to your library, browse them through a 3D carousel, grid, or list view, and stream music directly in the browser with a custom player — no Spotify app required.

![Stack](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react) ![Stack](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js) ![Stack](https://img.shields.io/badge/MySQL-Relational-4479A1?style=flat&logo=mysql) ![Stack](https://img.shields.io/badge/Spotify-Web_API-1DB954?style=flat&logo=spotify)

---

## Features

- **Collection Views** — Browse your saved albums in a 3D carousel, grid, or list. Switch between them instantly.
- **3D Carousel** — Vertical cylinder carousel with scroll wheel, keyboard arrow, swipe, and click navigation.
- **Spotify Search** — Search the full Spotify catalogue and save albums to your personal collection in one click.
- **In-Browser Playback** — Stream full tracks directly in the app via the Spotify Web Playback SDK. No redirects.
- **Album Page** — Full tracklist with per-track playback, album art, metadata, and prev/next navigation between saved albums.
- **Fullscreen Mode** — Immersive listening view with a blurred animated backdrop, floating color orbs extracted from the album art, and auto-hiding UI.
- **Mini Player** — Persistent floating player visible across all pages when music is playing. Clicking the art navigates to that album.
- **Auto Token Refresh** — Spotify access tokens are silently refreshed before expiry so playback never drops mid-session.
- **Authentication** — JWT-based signup, login, and logout. Passwords hashed with bcrypt. All collection data is scoped per user.
- **Responsive** — Scales across mobile, tablet, and desktop.

---

## Tech Stack

**Frontend**
- React 19 + Vite
- React Router v7
- Tailwind CSS v4 with custom design tokens
- Spotify Web Playback SDK

**Backend**
- Node.js + Express 5
- MySQL with mysql2
- JWT authentication (jsonwebtoken)
- Password hashing (bcryptjs)
- Input validation (express-validator)
- Spotify Web API (OAuth 2.0, album search, token refresh)

---

## Setup

### Requirements
- Node.js 18+
- MySQL

### 1 — Clone the repo

```bash
git clone https://github.com/BrunoShima/Bruno_SOM.git
cd Bruno_SOM
```

### 2 — Database

Create a MySQL database and import the schema:

```bash
mysql -u root -p -e "CREATE DATABASE som_db;"
mysql -u root -p som_db < server/exported-db.sql
```

### 3 — Spotify App

Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and create an app.

Set the redirect URI to: `http://localhost:3000/spotify/callback`

### 4 — Environment variables

Create `server/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=som_db

JWT_SECRET=your_jwt_secret

SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/spotify/callback
```

### 5 — Install & run

```bash
# Backend
cd server
npm install
npm run dev

# Frontend (new terminal)
cd client
npm install
npm run dev
```

The app will be at `http://localhost:5173`.

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users` | Register a new account |
| POST | `/users/signin` | Login — returns a JWT |

### Albums *(JWT required)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/albums` | Get all albums for the authenticated user |
| GET | `/albums/:id` | Get a single album |
| POST | `/albums` | Save a new album |
| PUT | `/albums/:id` | Update an album |
| DELETE | `/albums/:id` | Delete an album |

### Artists *(JWT required)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/artists` | Get all artists |
| POST | `/artists` | Create an artist |

### Spotify
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/spotify/login` | Redirect to Spotify OAuth |
| GET | `/spotify/callback` | Handle OAuth callback |
| GET | `/spotify/refresh` | Refresh an access token |
| GET | `/spotify/search?q=` | Search Spotify for albums |

---

## Notes

Playback requires a **Spotify Premium** account. Browsing and managing your collection works without connecting Spotify.
