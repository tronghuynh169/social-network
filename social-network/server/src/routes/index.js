const authRouter = require("./authRoutes");
const profileRoutes = require("./profileRoutes");

function route(app) {
    app.get("/", (req, res) => {
        res.send("Welcome to Social Network API!");
    });
    app.use("/api/auth", authRouter);
    app.use("/api/profile", profileRoutes);
}

module.exports = route;
