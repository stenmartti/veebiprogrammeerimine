const express = require('express');
const router = express.Router();
const loginCheck = require('../src/checkLogin');
const {kasutajagallery} = require('../controllers/kasutajagalleryControllers');

//kontrollin sisselogimist
router.use(loginCheck.isLogin);

//kasutatavad kontrollerid
const {
    gallery} = require('../controllers/galleryControllers');

router.route('/').get(kasutajagallery)

module.exports = router;