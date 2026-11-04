const mysql = require('mysql2/promise');

//@desc page for viewing public photos
//@route GET /photogallery
//@access public

const gallery = async (req, res) => {
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const sqlReq = 'SELECT filename, alttext FROM galleryphotos WHERE privacy >= ? AND deleted IS NULL ORDER BY id DESC';
		const [sqlRes] = await conn.execute(sqlReq, [2]);
		res.render('gallery', {galleryData: sqlRes});
	}
	catch(err) {
		console.log('Galerii lugemise viga: ' + err);
		res.render('gallery', {galleryData: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

module.exports = {
    gallery
};