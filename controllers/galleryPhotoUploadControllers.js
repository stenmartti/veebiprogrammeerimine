const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const sharp = require('sharp');

//@desc page for uploading photos to gallery
//@route GET /galleryPhotoUpload
//@access public

const galleryPhotoUpload = (req, res) => {
	res.render('galleryphotoupload');
};


//@desc page for uploading photos to gallery
//@route GET /galleryPhotoUpload
//@access public

const galleryPhotoUploadPost = async (req, res) => {
	//console.log(req.file);
	//console.log(req.body);
	let conn;
	try {
		//genereerida oma failinime
		const fileName = 'vp_' + Date.now() + '.jpg';
		await fs.rename(req.file.path, req.file.destination + fileName);
		//pildi väiksemaks muutmine
		await sharp(req.file.destination + fileName)
			.resize(800, 600)
			.composite([{input: 'public/pic/vp_logo_small.png', gravity: 'southeast'}])
			.jpeg({quality: 90})
			.toFile(process.env.UPLOAD_RESIZED_PATH + fileName);
		//teeme ka pisipildi
		await sharp(req.file.destination + fileName).resize(100, 100).jpeg({quality: 90}).toFile(process.env.UPLOAD_THUMBNAIL_PATH + fileName);
		let sqlReq = 'INSERT INTO galleryphotos (filename, origname, alttext, privacy, userid) VALUES (?,?,?,?,?)';
		//const userId = 1; //ajutine kuni teeme kasutajakontod ja sisselogimise
		const userId = req.session.userId;
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const[result] = await conn.execute(sqlReq, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, userId]);
		console.log('Salvestati foto kirje id:' + result.insertId);
	}
	catch (err) {
		console.log('viga: ' + err);
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
	return res.render('galleryphotoupload');

};


module.exports = {
galleryPhotoUpload,
galleryPhotoUploadPost
}
