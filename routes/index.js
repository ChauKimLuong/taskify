const clientRoutes = require('./client/index.route');

module.exports = (app) => {
    app.use('/', clientRoutes);

    // sau này:
    // app.use('/admin', adminRoutes);
};