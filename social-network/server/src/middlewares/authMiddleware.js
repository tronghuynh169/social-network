const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader)
        return res.status(401).json({ message: 'Không có quyền truy cập' });

    // Tách "Bearer " ra khỏi token
    const token = authHeader.split(' ')[1];
    if (!token)
        return res
            .status(401)
            .json({ message: 'Token không hợp lệ hoặc thiếu' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res
            .status(401)
            .json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};

module.exports = auth;
