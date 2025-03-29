const authRouter = require("./authRoutes");
const profileRoutes = require("./profileRoutes");
const avatarRoutes = require("./avatarRoutes");

function route(app) {
    app.get("/", (req, res) => {
        res.send("Welcome to Social Network API!");
    });
    app.use("/api/auth", authRouter);
    app.use("/api/profile", profileRoutes);
    app.use("/api/avatar", avatarRoutes);
}

module.exports = route;
