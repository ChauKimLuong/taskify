const express = require('express');
const router = express.Router();

const authRoute = require('./auth.route');
const homeController = require('../../controllers/client/home.controller');
const authMiddleware = require('../../middlewares/auth.middleware');


router.get('/', authMiddleware, homeController.index);
router.use('/', authRoute);

module.exports = router;