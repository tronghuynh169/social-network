const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // Cho phép frontend gọi API từ backend

app.get('/', (req, res) => {
    res.send('API đang chạy...');
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`));
