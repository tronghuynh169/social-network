const express = require("express");
const router = express.Router();
const { uploadImage } = require("../controllers/uploadController");
const uploadMessageImage = require("../config/multerMessage");

// Route upload ảnh
router.post("/", uploadMessageImage, uploadImage);

module.exports = router;
