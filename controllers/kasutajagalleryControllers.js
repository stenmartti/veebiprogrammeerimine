const mysql = require('mysql2/promise');

//@desc page for viewing public photos
//@route GET /photogallery
//@access public

const kasutajagallery = async (req, res) => {
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const sqlReq = 'SELECT filename, alttext, privacy FROM galleryphotos WHERE userid = ? AND deleted IS NULL ORDER BY id DESC';
		const [sqlRes] = await conn.execute(sqlReq, [req.session.userId]);
		
		res.render('kasutajagallery', {kasutajagalleryData: sqlRes});
	}
	catch(err) {
		console.log('Galerii lugemise viga: ' + err);
		res.render('kasutajagallery', {kasutajagalleryData: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};



module.exports = {
    kasutajagallery
};