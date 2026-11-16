const express = require('express');
const router = express.Router();
const loginCheck = require('../src/checkLogin');

//kontrollin sisselogimist
router.use(loginCheck.isLogin);

//kasutatavad kontrollerid
const {
    gallery} = require('../controllers/galleryControllers');

router.route('/').get(gallery);

module.exports = router;