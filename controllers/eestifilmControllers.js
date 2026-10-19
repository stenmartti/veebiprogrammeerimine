const mysql = require('mysql2/promise');

//@desc home page for Estonian Film section
//@route GET /eestifilm
//@access public


//app.get('/eestifilm', (req, res)=>{
    const eestifilm = (req, res) => {
	res.render('eestifilm');
};


//@desc home page for people involved in Estonian Film industry
//@route GET /eestifilm/inimesed
//@access public

//app.get('/eestifilm/inimesed', async (req, res)=>{
const inimesed = async (req, res) => {
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		//defineerime SQL päringu
		let sqlReq = 'SELECT * FROM person';
		const [sqlRes] = await conn.execute(sqlReq);
		//console.log(sqlRes);
		res.render('eestifilminimesed', {personList: sqlRes});
	}
	catch(err) {
		console.log('Andmebaasiga suhtlemise viga' + err);
		res.render('eestifilminimesed', {personList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
	
};


//app.get('/eestifilm/inimesed_lisa', (req, res)=>{
const inimesedAdd = (req, res) => {
	res.render('eestifilminimesed_lisa', {notice: 'Ootan sisestust!', firstName: null, lastName: null, born: null, deceased: null});
};


//@desc home page for adding people involved in Estonian Film industry
//@route POST /eestifilm/inimesed
//@access public

//app.post('/eestifilm/inimesed_lisa', async (req, res)=>{
const inimesedAddPost = async (req, res) => {
	console.log(req.body);
	//kontrollime andmeid, iga sisendi kohta eraldi, vead kogume muutujasse notice
	let notice = '';
	//sisestatud sünnikuupäev (tekst) teisendada kuupäevaks
	const bornDate = new Date(req.body.bornInput);
	const timeNow = new Date();
	if(!req.body.firstNameInput){
		notice += 'Eesnimi on puudu! ';
	}
	if(!req.body.lastNameInput){
		notice += 'Perekonnanimi on puudu! ';
	}
	if(!req.body.bornInput){
		notice += 'Sünnikuupäev on puudu! ';
	}
	else if(isNaN(bornDate.getTime())){
		notice += 'Sünnikuupäev ei ole reaalne kuupäev! ';
	}
	else if(bornDate > timeNow){
		notice += 'Sünnikuupäev ei saa olla tulevikus! ';
	}
	let deceasedDate = null;
	if(req.body.deceasedInput != ''){
		deceasedDate = req.body.deceasedInput;
		//surmakuupäev (tekst) teisendada kuupäevaks
		const deceasedObj = new Date(req.body.deceasedInput);
		if(isNaN(deceasedObj.getTime())){
			notice += 'Surmakuupäev ei ole reaalne kuupäev! ';
		}
		else if(deceasedObj > timeNow){
			notice += 'Surmakuupäev ei saa olla tulevikus! ';
		}
		else if(deceasedObj < bornDate){
			notice += 'Surmakuupäev ei saa olla varasem kui sünnikuupäev! ';
		}
	}
	//kui vigu leidus, saadame sisestatud väärtused mallile tagasi, et neid ei peaks uuesti kirjutama
	if(notice != ''){
		console.log("Andmed pole korrektsed!");
		return res.render('eestifilminimesed_lisa', {notice: notice, firstName: req.body.firstNameInput, lastName: req.body.lastNameInput, born: req.body.bornInput, deceased: req.body.deceasedInput});
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let sqlReq = 'INSERT INTO person (first_name, last_name, born, deceased) VALUES (?,?,?,?)';
		await conn.execute(sqlReq, [
			req.body.firstNameInput, 
			req.body.lastNameInput,
			req.body.bornInput,
			deceasedDate
		]);
		//korrektse sisestuse puhul jatame sisendid tühjaks (null)
		res.render('eestifilminimesed_lisa' , {notice: req.body.firstNameInput + req.body.lastNameInput + ' andmebaasi lisatud!', firstName: null, lastName: null, born: null, deceased: null});
	}
	catch (err){
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		//andmebaasi vea korral jaavad sisestatud vaartused alles
		res.render('eestifilminimesed_lisa' , {notice: 'andmebaasi ei lisatud midagi', firstName: req.body.firstNameInput, lastName: req.body.lastNameInput, born: req.body.bornInput, deceased: req.body.deceasedInput});

	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//app.get('/eestifilm/filmid_lisa', (req, res)=>{
const eestiFilmAdd = (req, res) => {
	res.render('eestifilmfilmid_lisa', {notice: 'Ootan sisestust!', title: null, releaseYear: null, duration: null, description: null});
}; 



//@desc home page for adding Estonian films
//@route POST /eestifilm/filmid_lisa
//@access public

//app.post('/eestifilm/filmid_lisa', async (req, res)=>{
const eestiFilmAddPost = async (req, res) => {    
	console.log(req.body);
	//kontrollime andmeid
	if(!req.body.titleInput || !req.body.releaseYearInput || !req.body.durationInput){
		console.log("Andmed pole korrektsed!");
		return res.render('eestifilmfilmid_lisa', {notice: 'Pealkiri, aasta ja kestus on kohustuslikud!', title: req.body.titleInput, releaseYear: req.body.releaseYearInput, duration: req.body.durationInput, description: req.body.descriptionInput});
	}
	//kirjeldus pole kohustuslik, tühja asemel salvestame andmebaasi null
	let description = null;
	if(req.body.descriptionInput != ''){
		description = req.body.descriptionInput;
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let sqlReq = 'INSERT INTO movie (title, release_year, duration_minutes, description) VALUES (?,?,?,?)';
		await conn.execute(sqlReq, [
			req.body.titleInput,
			req.body.releaseYearInput,
			req.body.durationInput,
			description
		]);
		res.render('eestifilmfilmid_lisa', {notice: req.body.titleInput + ' andmebaasi lisatud!', title: null, releaseYear: null, duration: null, description: null});
	}
	catch (err){
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilmfilmid_lisa', {notice: 'andmebaasi ei lisatud midagi', title: req.body.titleInput, releaseYear: req.body.releaseYearInput, duration: req.body.durationInput, description: req.body.descriptionInput});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};


//abifunktsioon: loeb rippmenüüde jaoks isikud, filmid ja ametid
const loeSeosteAndmed = async (conn) => {
	const [personList] = await conn.execute('SELECT id, first_name, last_name FROM person ORDER BY last_name, first_name');
	const [movieList] = await conn.execute('SELECT id, title, release_year FROM movie ORDER BY title');
	const [professionList] = await conn.execute('SELECT id, title FROM profession ORDER BY title');
	return {personList: personList, movieList: movieList, professionList: professionList};
};


const eestiFilmSeosed = async (req, res) => {
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const andmed = await loeSeosteAndmed(conn);
		res.render('eestifilmseosed', {notice: 'Ootan sisestust!', personList: andmed.personList, movieList: andmed.movieList, professionList: andmed.professionList, selectedPerson: null, selectedMovie: null, selectedProfession: null, characterName: null});
	}
	catch(err) {
		console.log('Andmebaasiga suhtlemise viga' + err);
		res.render('eestifilmseosed', {notice: 'Andmete lugemine ebaõnnestus!', personList: [], movieList: [], professionList: [], selectedPerson: null, selectedMovie: null, selectedProfession: null, characterName: null});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//@desc home page for adding 
//@route POST /eestifilm/seosed
//@access public

const eestiFilmSeosedPost = async (req, res) => {
	console.log(req.body);
	let conn;
	//rippmenüüde sisu, et vea korral saaks vormi uuesti näidata
	let andmed = {personList: [], movieList: [], professionList: []};
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		andmed = await loeSeosteAndmed(conn);
		//kontrollime, et kõik kolm rippmenüüd on valitud
		if(!req.body.personInput || !req.body.movieInput || !req.body.professionInput){
			console.log("Andmed pole korrektsed!");
			return res.render('eestifilmseosed', {notice: 'Vali isik, film ja amet!', personList: andmed.personList, movieList: andmed.movieList, professionList: andmed.professionList, selectedPerson: req.body.personInput, selectedMovie: req.body.movieInput, selectedProfession: req.body.professionInput, characterName: req.body.characterInput});
		}
		//leiame valitud ameti nimetuse, et teada, kas tegemist on näitlejaga
		const profession = andmed.professionList.find(function(p){
			return String(p.id) === req.body.professionInput;
		});
		//tegelaskuju salvestame ainult näitleja puhul, muidu null
		let characterName = null;
		if(profession && profession.title.toLowerCase() === 'näitleja' && req.body.characterInput && req.body.characterInput.trim() !== ''){
			characterName = req.body.characterInput.trim();
		}
		//enne salvestamist kontrollime, kas täpselt sama seos on juba olemas
		//<=> on NULL-i suhtes turvaline võrdlus (tavaline = ei sobi, kui tegelaskuju on NULL)
		let sqlReq = 'SELECT id FROM person_in_movie WHERE person_id = ? AND movie_id = ? AND profession_id = ? AND character_name <=> ?';
		const [sqlRes] = await conn.execute(sqlReq, [
			req.body.personInput,
			req.body.movieInput,
			req.body.professionInput,
			characterName
		]);
		if(sqlRes.length > 0){
			//vaste leiti, seega selline seos on juba olemas ja salvestamisest loobume
			return res.render('eestifilmseosed', {notice: 'Selline seos on juba olemas, midagi ei lisatud!', personList: andmed.personList, movieList: andmed.movieList, professionList: andmed.professionList, selectedPerson: req.body.personInput, selectedMovie: req.body.movieInput, selectedProfession: req.body.professionInput, characterName: req.body.characterInput});
		}
		sqlReq = 'INSERT INTO person_in_movie (person_id, movie_id, profession_id, character_name) VALUES (?,?,?,?)';
		await conn.execute(sqlReq, [
			req.body.personInput,
			req.body.movieInput,
			req.body.professionInput,
			characterName
		]);
		//korrektse sisestuse puhul jätame valikud tühjaks (null)
		res.render('eestifilmseosed', {notice: 'Seos andmebaasi lisatud!', personList: andmed.personList, movieList: andmed.movieList, professionList: andmed.professionList, selectedPerson: null, selectedMovie: null, selectedProfession: null, characterName: null});
	}
	catch (err){
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilmseosed', {notice: 'andmebaasi ei lisatud midagi', personList: andmed.personList, movieList: andmed.movieList, professionList: andmed.professionList, selectedPerson: req.body.personInput, selectedMovie: req.body.movieInput, selectedProfession: req.body.professionInput, characterName: req.body.characterInput});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

const eestiFilmSeosedList = async (req, res) => {
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		//JOIN-iga asendame id-d päris nimedega
		let sqlReq = 'SELECT person.first_name, person.last_name, movie.title AS movie_title, movie.release_year, profession.title AS profession_title, person_in_movie.character_name FROM person_in_movie JOIN person ON person_in_movie.person_id = person.id JOIN movie ON person_in_movie.movie_id = movie.id JOIN profession ON person_in_movie.profession_id = profession.id ORDER BY movie.title, person.last_name';
		const [sqlRes] = await conn.execute(sqlReq);
		res.render('eestifilmseosed_nimekiri', {relationList: sqlRes});
	}
	catch(err) {
		console.log('Andmebaasiga suhtlemise viga' + err);
		res.render('eestifilmseosed_nimekiri', {relationList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};



//app.get('/eestifilm/ametid_lisa', (req, res)=>{
const ametidAdd = (req, res) => {    
	res.render('eestifilmametid_lisa', {notice: 'Ootan sisestust!', title: null, description: null});
};

//app.post('/eestifilm/ametid_lisa', async (req, res)=>{
const ametidAddPost = async (req, res) => {
	console.log(req.body);
	//kontrollime andmeid
	if(!req.body.titleInput){
		console.log("Andmed pole korrektsed!");
		return res.render('eestifilmametid_lisa', {notice: 'Ameti nimetus on kohustuslik!', title: req.body.titleInput, description: req.body.descriptionInput});
	}
	let description = null;
	if(req.body.descriptionInput != ''){
		description = req.body.descriptionInput;
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let sqlReq = 'INSERT INTO profession (title, description) VALUES (?,?)';
		await conn.execute(sqlReq, [
			req.body.titleInput,
			description
		]);
		res.render('eestifilmametid_lisa', {notice: req.body.titleInput + ' andmebaasi lisatud!', title: null, description: null});
	}
	catch (err){
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilmametid_lisa', {notice: 'andmebaasi ei lisatud midagi', title: req.body.titleInput, description: req.body.descriptionInput});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};











module.exports = {
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
    eestiFilmSeosedList
}
