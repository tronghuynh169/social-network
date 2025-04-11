const path = require("path");

const uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Không có file được tải lên" });
    }

    const imageUrl = `http://localhost:5000/uploads/messages/${req.file.filename}`;
    res.status(200).json({ url: imageUrl });
};

module.exports = { uploadImage };
