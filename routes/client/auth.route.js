const express = require('express');
const router = express.Router();

const authController = require('../../controllers/client/auth.controller');

router.get('/login', authController.getLogin);
router.get('/sign-up', authController.getRegister);

// chuẩn bị cho bước sau
router.post('/login', authController.postLogin);
router.post('/sign-up', authController.postRegister);

module.exports = router;