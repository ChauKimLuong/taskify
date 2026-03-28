const express = require('express');
const router = express.Router();

const authRoute = require('./auth.route');
const homeController = require('../../controllers/client/home.controller');
const dashboardController = require('../../controllers/client/dashboard.controller');
const projectController = require('../../controllers/client/project.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireProjectMember, requireProjectRole } = require('../../middlewares/role.middleware');

// Public
router.get('/', homeController.index);

// Auth routes
router.use('/', authRoute);

// Dashboard (requires login)
router.get('/dashboard', authMiddleware, dashboardController.dashboard);

// Projects
router.get('/projects/create', authMiddleware, projectController.getCreate);
router.post('/projects/create', authMiddleware, projectController.postCreate);
router.get('/projects/:id', authMiddleware, requireProjectMember, projectController.getProject);
router.get('/projects/:id/tasks/:taskId', authMiddleware, requireProjectMember, projectController.getTaskDetail);
router.post('/projects/:id/members', authMiddleware, requireProjectRole('team_leader'), projectController.addMember);
router.post('/projects/:id/tasks', authMiddleware, requireProjectRole('team_leader'), projectController.createTask);
router.patch('/projects/:id/tasks/:taskId/status', authMiddleware, requireProjectMember, projectController.updateTaskStatus);
router.patch('/projects/:id/tasks/:taskId', authMiddleware, requireProjectMember, projectController.patchTask);
router.post('/projects/:id/tasks/:taskId/assign', authMiddleware, requireProjectRole('team_leader'), projectController.assignTask);
router.post('/projects/:id/tasks/:taskId/comments', authMiddleware, requireProjectMember, projectController.addComment);

module.exports = router;
