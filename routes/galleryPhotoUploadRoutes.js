const express = require('express');
const multer = require('multer');
const router = express.Router();
 
//seadistame multer vahevara (middleware) failide üleslaadimiseks
//määran üleslaadimise kataloogi
const upload = multer({dest: process.env.UPLOAD_ORIGINAL_PATH});


//kasutatavad kontrollerid
const {
    galleryPhotoUpload,
    galleryPhotoUploadPost} = require('../controllers/galleryPhotoUploadControllers');

router.route('/').get(galleryPhotoUpload);

//post osa suunatakse läbi vahevara - upload
router.route('/').post(upload.single('photoInput'), galleryPhotoUploadPost);


module.exports = router;