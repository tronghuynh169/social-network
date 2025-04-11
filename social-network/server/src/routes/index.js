const authRouter = require("./authRoutes");
const profileRoutes = require("./profileRoutes");
const avatarRoutes = require("./avatarRoutes");
const postRoutes = require("./postRoutes");
const chatRoutes = require("./chatRoutes");
const uploadRoutes = require("./uploadRoutes");
function route(app) {
    app.get("/", (req, res) => {
        res.send("Welcome to Social Network API!");
    });
    app.use("/api/auth", authRouter);
    app.use("/api/profile", profileRoutes);
    app.use("/api/avatar", avatarRoutes);
    app.use("/api/posts", postRoutes);
    app.use("/api/chat", chatRoutes);
    app.use("/api/upload", uploadRoutes);
}

module.exports = route;
