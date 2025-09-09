const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Route test
app.get('/', (req, res) => {
    res.send('Hệ thống đăng ký học theo tín chỉ đang chạy...');
});

// Chạy server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
});
