const express = require('express');
const router = express.Router();

//kasutatavad kontrollerid
const {
    gallery} = require('../controllers/galleryControllers');

router.route('/').get(gallery);

module.exports = router;