// Verifies the JWT token on protected routes
// Attaches the authenticated user's ID to req.userId

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    // Get the token from the Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        // Verify the token using our secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user's ID to the request so routes can use it
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;