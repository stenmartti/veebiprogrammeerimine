const mysql = require('mysql2/promise');
const validator = require('validator');
const argon = require('argon2');



//@desc page for creating user account
//@route GET /signup
//@access public

const signupPage = (req, res) => {
	res.render('signup', {notice: 'Ootan andmeid!'});
};


//@desc page for creating user account
//@route POST /signup
//@access public

const signupPagePost = async (req, res) => {
	let conn;
	//andmete puhastamine ja valideerimine
	const firstName = validator.escape(req.body.firstNameInput.trim());
	const lastName = validator.escape(req.body.lastNameInput.trim());
	const birthDate = req.body.birthDateInput;
	const gender = req.body.genderInput;
	const email = req.body.emailInput.trim();
	const password = req.body.passwordInput;
	const confirmPassword = req.body.confirmPasswordInput;

	//kontrollime kas kõik oluline on olemas
	if(!firstName || !lastName || !birthDate || !gender || !email || !password || !confirmPassword){
		notice = 'Andmeid on puudu või miski pole korrektne!';
		return res.render('signup', {notice: notice});
	}

	//kas email on korrektne
	if(!validator.isEmail(email)){
		notice = 'emaili aadress pole korrektne!';
		return res.render('signup', {notice: notice});
	}

	//kas parool on piisavalt tugev
	const passwordOptions = {minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0};
	if(!validator.isStrongPassword(password, passwordOptions)){
		notice = 'Valitud salasõna on liiga nõrk, vaja on suur ja väiketähti, numbreid ja kokku minimaalselt 8 märki!';
		return res.render('signup', {notice: notice});
	}

	//kas paroolid ühtivad
	if(password !== confirmPassword){
		notice = 'Sisestatud salasõnad ei ole ühesugused!';
		return res.render('signup', {notice: notice});
	}

	//sünnikuupäeva kontrollimine
	if(!validator.isDate(birthDate) || validator.isAfter(birthDate)){
		notice = 'Valitud sünnikuupäev ei ole korrektne!';
		return res.render('signup', {notice: notice});
	}

	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		//kontrollin kas selline kasutaja on juba äkki olemas
		let sqlReq = 'SELECT id FROM users WHERE email = ?';
		const [users] = await conn.execute(sqlReq, [email]);
		if(users.length > 0){
			notice = 'Kasutaja on juba olemas!';
			return res.render('signup', {notice: notice});
		}

		
		//krüpteerimine parooli
		const pwdHash = await argon.hash(password);

		sqlReq = 'INSERT INTO users (firstname, lastname, birthdate, gender, email, password) VALUES (?,?,?,?,?,?)';
		const [result] = await conn.execute(sqlReq, [
			firstName,
			lastName,
			birthDate,
			gender,
			email,
			pwdHash
		]);


		res.render('signup', {notice: 'kasutaja konto loodud!'});
	}
	catch (err) {
		console.log('viga: ' + err);
		res.render('signup', {notice: 'konto loomine ei õnnestunud!'} );
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
	return res.render('signup');

};


module.exports = {
signupPage,
signupPagePost
}
