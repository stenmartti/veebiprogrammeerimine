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


const eestiFilmSeosed = async (req, res) => {
    //muuda siin notice ja asjad ära
    res.render('eestifilmseosed', {notice: 'Ootan sisestust!', title: null, description: null});
};

//@desc home page for adding 
//@route POST /eestifilm/seosed
//@access public

const eestiFilmSeosedPost = async (req, res) => {


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
    eestiFilmSeosedPost
}
