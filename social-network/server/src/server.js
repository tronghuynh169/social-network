const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./database/connection");
const route = require("./routes");
const path = require("path");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

route(app);
console.log("JWT_SECRET:", process.env.JWT_SECRET);
app.listen(5000, () => console.log("🚀 Server running on port 5000"));
