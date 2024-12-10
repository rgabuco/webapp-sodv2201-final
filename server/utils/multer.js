const multer = require('multer');
const path = require('path');

// Define storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile_photos'); // Store images in the "uploads/profile_photos" folder
  },
  filename: (req, file, cb) => {
    // Generate a unique filename for each image
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Use the current timestamp as part of the filename
  }
});

// Filter files to allow only images (jpeg, png, jpg)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type. Only JPEG, JPG, and PNG are allowed.'), false);
};

// Setup multer middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Max file size of 2MB
  fileFilter: fileFilter
});

module.exports = upload;
