const express = require('express');
const router = express.Router();

const authRoute = require('./auth.route');
const homeController = require('../../controllers/client/home.controller');
const dashboardController = require('../../controllers/client/dashboard.controller');
const projectController = require('../../controllers/client/project.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireProjectMember, requireProjectRole } = require('../../middlewares/role.middleware');
const upload = require('../../config/multer');

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
router.get('/projects/:id/members', authMiddleware, requireProjectMember, projectController.getProjectMembers);
router.get('/projects/:id/tasks/:taskId', authMiddleware, requireProjectMember, projectController.getTaskDetail);
router.post('/projects/:id/members', authMiddleware, requireProjectRole('team_leader'), projectController.addMember);
router.post('/projects/:id/members/:userId/delete', authMiddleware, requireProjectRole('team_leader'), projectController.deleteMember);
router.post('/projects/:id/delete', authMiddleware, requireProjectRole('team_leader'), projectController.deleteProject);
router.post('/projects/:id/edit', authMiddleware, requireProjectRole('team_leader'), projectController.updateProject);
router.post('/projects/:id/tasks', authMiddleware, requireProjectRole('team_leader'), projectController.createTask);
router.patch('/projects/:id/tasks/:taskId/status', authMiddleware, requireProjectMember, projectController.updateTaskStatus);
router.patch('/projects/:id/tasks/:taskId', authMiddleware, requireProjectMember, projectController.patchTask);
router.post('/projects/:id/tasks/:taskId/assign', authMiddleware, requireProjectRole('team_leader'), projectController.assignTask);
router.post('/projects/:id/tasks/:taskId/comments', authMiddleware, requireProjectMember, projectController.addComment);

// Labels
router.post('/projects/:id/tasks/:taskId/labels', authMiddleware, requireProjectMember, projectController.addLabel);
router.post('/projects/:id/tasks/:taskId/labels/:labelId/delete', authMiddleware, requireProjectMember, projectController.deleteLabel);

// Attachments
router.post('/projects/:id/tasks/:taskId/attachments', authMiddleware, requireProjectMember, upload.single('attachment'), projectController.addAttachment);
router.post('/projects/:id/tasks/:taskId/attachments/:attachId/delete', authMiddleware, requireProjectMember, projectController.deleteAttachment);

module.exports = router;
