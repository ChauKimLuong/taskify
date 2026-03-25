const express = require('express');
const router = express.Router();

const authController = require('../../controllers/client/auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');

router.get('/login', authController.getLogin);
router.get('/logout', authController.logout);
router.get('/sign-up', authController.getRegister);

// chuẩn bị cho bước sau
router.post('/login', authController.postLogin);
router.post('/sign-up', authController.postRegister);
router.post('/pm/users/:id/role', authMiddleware, requireRole('project_manager'), authController.updateUserRole);

module.exports = router;
