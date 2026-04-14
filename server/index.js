// Sets up middleware and mounts all routers

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

const albumsRoutes = require("./routes/albumsRoutes");
const artistsRoutes = require("./routes/artistsRoutes");
const usersRoutes = require("./routes/usersRoutes");
const spotifyRoutes = require("./routes/spotifyRoutes");

app.use(cors());

// Serve uploaded images as static files from the public folder
app.use(express.static("public"));

// Parse incoming JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routers
app.use("/albums", albumsRoutes);
app.use("/artists", artistsRoutes);
app.use("/users", usersRoutes);
app.use("/spotify", spotifyRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
});

app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found." });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});