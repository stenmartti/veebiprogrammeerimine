const express = require('express');
const router = express.Router();

//kasutatavad kontrollerid
const {
    eestifilm, 
    inimesed,
    inimesedAdd,
    inimesedAddPost,
    eestiFilmAdd,
    eestiFilmAddPost,
    ametidAdd,
    ametidAddPost,
    eestiFilmSeosed,
    eestiFilmSeosedPost,
eestiFilmSeosedList} = require('../controllers/eestifilmControllers');

router.route('/').get(eestifilm);

router.route('/inimesed').get(inimesed);

router.route('/inimesed_lisa').get(inimesedAdd);

router.route('/inimesed_lisa').post(inimesedAddPost);

router.route('/filmid_lisa').get(eestiFilmAdd);

router.route('/filmid_lisa').post(eestiFilmAddPost);

router.route('/ametid_lisa').get(ametidAdd);

router.route('/ametid_lisa').post(ametidAddPost);

router.route('/seosed').get(eestiFilmSeosed);

router.route('/seosed').post(eestiFilmSeosedPost);

router.route('/seosed_nimekiri').get(eestiFilmSeosedList);



module.exports = router;