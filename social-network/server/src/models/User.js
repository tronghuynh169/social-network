const mongoose = require('mongoose');
const slugify = require("slugify"); 

const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true }, 
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        fullName: { type: String, required: true }, // Tên đầy đủ của người dùng
        dateOfBirth: { type: Date, required: true }, // Ngày sinh của người dùng
    },
    { timestamps: true }
); // Thêm thời gian tạo & cập nhật tự động

// 🔥 Tạo slug tự động trước khi lưu vào DB
UserSchema.pre("save", function (next) {
    if (this.fullName) {
        this.slug = slugify(this.fullName, { lower: true, strict: true });
    }
    next();
});

module.exports = mongoose.model('User', UserSchema);
