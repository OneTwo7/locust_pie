const express = require('express');
const requireAll = require('require-all');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('express-jwt');
const morgan = require('morgan');
const {
  ensureAuthenticated,
  PUBLIC_ROUTES,
} = require('forest-express-mongoose');
const coursesRoutes = require('./routes/courses');
const lessonsRoutes = require('./routes/lessons');
const usersRoutes = require('./routes/users');

async function createApp() {
    const app = express();

    app.use(morgan('tiny'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));

    let allowedOrigins = [/forestadmin\.com$/];

    if (process.env.CORS_ORIGINS) {
        allowedOrigins = allowedOrigins.concat(process.env.CORS_ORIGINS.split(','));
    }

    app.use(cors({
        origin: true,
        allowedHeaders: ['Authorization', 'X-Requested-With', 'Content-Type'],
        maxAge: 86400, // NOTICE: 1 day
        credentials: true,
    }));

    app.use(jwt({
        secret: process.env.FOREST_AUTH_SECRET,
        credentialsRequired: false,
    }));

    app.use('/forest', (request, response, next) => {
        if (PUBLIC_ROUTES.includes(request.url)) {
            return next();
        }
        return ensureAuthenticated(request, response, next);
    });

    app.use('/forest', coursesRoutes);
    app.use('/forest', lessonsRoutes);
    app.use('/forest', usersRoutes);

    const middlewares = requireAll({
        dirname: path.join(__dirname, 'middlewares'),
        recursive: true,
        resolve: Module => Module(app),
    });

    await Promise.all(Object.keys(middlewares).map((key) => middlewares[key]));

    return app;
}

module.exports = createApp;
