const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./database/connection');
const route = require('./routes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

route(app);

app.listen(5000, () => console.log('🚀 Server running on port 5000'));
