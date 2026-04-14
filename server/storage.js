// Configures and exports the multer middleware for handling image file uploads
// Uploaded files are saved to public/images 

const multer = require("multer");

// Tell multer where to save files and how to name them
const storage = multer.diskStorage({

    // The folder where uploaded images will be stored
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },

    // Give each file a unique name using a timestamp + original filename
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
    },
});

const upload = multer({ storage: storage });

module.exports = upload;