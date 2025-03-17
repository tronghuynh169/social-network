const authRouter = require('./authRoutes');

function route(app) {
    app.get('/', (req, res) => {
        res.send('Welcome to Social Network API!');
    });
    app.use('/auth', authRouter);
}

module.exports = route;
