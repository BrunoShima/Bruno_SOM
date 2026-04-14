# Album Collection App (Full-Stack)

## Project Description
This project is a full-stack web application built with Express.js and React. It's an upscaled version of Assignment 1 — the same album collection concept, but now with a real MySQL database, a functioning UI, and the ability to upload cover art. You can browse, add, edit, and delete albums, as well as filter by artist.

This is the beginning of what I eventually want to be a personal digital vinyl library.

## Tech / Concepts Used
- Express.js + React
- MySQL with mysql2
- Routes + Routers
- Middleware (cors, multer, express.json)
- CRUD endpoints
- File uploads (cover art stored as static files)
- React Router (page navigation)
- Tailwind CSS (styling)
- Two-table relational database with foreign keys

## Data Structure
Each album contains:
- `id` (number)
- `title` (string)
- `image_filename` (string)
- `year` (number)
- `artist_id` (foreign key → artists table)

Each artist contains:
- `id` (number)
- `name` (string)

## How to Run the Project

### Requirements
- Node.js
- MAMP

### Database Setup
1. Open MAMP and start the servers
2. Go to phpMyAdmin at `http://localhost:8888/phpMyAdmin`
3. Create a new database called `bs_albums`
4. Click the **Import** tab, select `exported-db.sql` from the `server/` folder and click **Go**

### Backend
1. Navigate to the `server/` folder:
   - `cd server`
2. Install dependencies:
   - `npm install`
3. Start the server:
   - `npm run dev`
4. The API will be running at `http://localhost:3000`

### Frontend
1. Navigate to the `client/` folder:
   - `cd client`
2. Install dependencies:
   - `npm install`
3. Start the app:
   - `npm run dev`
4. Open the URL shown in the terminal (usually `http://localhost:5173`)

## Endpoints (CRUD)

### Albums
`GET /albums` — Returns all albums joined with artist name  
`GET /albums/:id` — Returns a single album  
`POST /albums` — Creates a new album (multipart/form-data for image upload)  
`PUT /albums/:id` — Updates an existing album  
`DELETE /albums/:id` — Deletes an album  

### Artists
`GET /artists` — Returns all artists  
`POST /artists` — Creates a new artist  

## Personal Notes
This was a significant step up from Assignment 1. Moving from an in-memory array to a real database forced me to think differently about how data is structured and related — the foreign key relationship between albums and artists was a new concept that took some getting used to.

File uploads were also new territory. Understanding how multer works on the backend, and how FormData works on the frontend to send both text and files in the same request, took some trial and error.

On the frontend side, working with React Router and passing callback props down through modal components to refresh data after changes was easy, as I've done this several times before for other projects

This project is a direct continuation of Assignment 1 and gets me closer to the personal vinyl library I mentioned there.

Some of this project was built with the assistance of Claude