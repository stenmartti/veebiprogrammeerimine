const express = require('express');
const router = express.Router();


//kasutatavad kontrollerid
const {
    regvisit,
    regvisitPost} = require('../controllers/regvisitControllers');

router.route('/').get(regvisit);

router.route('/').post(regvisitPost);



module.exports = router;