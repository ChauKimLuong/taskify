const express = require('express');
const router = express.Router();

const authController = require('../../controllers/client/auth.controller');

router.get('/login', authController.getLogin);
router.get('/register', authController.getRegister);

// chuẩn bị cho bước sau
// router.post('/login', authController.postLogin);
router.post('/register', authController.postRegister);

module.exports = router;