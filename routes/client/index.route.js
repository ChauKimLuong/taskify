const express = require('express');
const router = express.Router();

const authRoute = require('./auth.route');
const homeController = require('../../controllers/client/home.controller');
const dashboardController = require('../../controllers/client/dashboard.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');


router.get('/', homeController.index);
router.get('/pm/dashboard', authMiddleware, requireRole('project_manager'), dashboardController.projectManagerDashboard);
router.get('/team-leader/dashboard', authMiddleware, requireRole('team_leader'), dashboardController.teamLeaderDashboard);
router.get('/member/kanban', authMiddleware, requireRole('member'), dashboardController.memberKanban);
router.use('/', authRoute);

module.exports = router;
