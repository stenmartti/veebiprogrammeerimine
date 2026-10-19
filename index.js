const express = require('express');
const fs = require('fs').promises;
//moodul POST pÃ¤ringute lahtiharutamiseks, parsimiseks
const bodyparser = require('body-parser');
//moodul andmebaasiga suhtlemiseks (koos async ehk ootamise osaga)
const mysql = require('mysql2/promise');
//moodul .env keskkonna muutujate lugemiseks
require('dotenv').config();

const dateET = require('./src/dateTimeET');

const textRef = "public/txt/vanasonad.txt";
const regtextRef = "public/txt/visits.txt";

//kÃ¤ivitan funktsiooni express() ja annan nimeks app
const app = express();
//mÃ¤Ã¤rame renderdusmootori: EJS
app.set('view engine', 'ejs');
//mÃ¤Ã¤rame avalikuna kasutatava kataloogi
app.use(express.static('public'));
//mÃ¤Ã¤rame vormide sisu parsimise
app.use(bodyparser.urlencoded({extended: false}));

//marsruudid
app.get('/', (req, res)=>{
	const dayNow = dateET.day();
	const dateNow = dateET.fullDate(0);
	const timeNow = dateET.fullTime();
	//res.send('Express.js veeb lÃ¤kski kÃ¤ima!');
	res.render('index', {dayNow: dayNow, dateNow: dateNow, timeNow: timeNow});
});

app.get('/mikstlu', (req, res)=>{
	res.render('mikstlu');
});

app.get('/viimanekulastus', async (req, res)=>{
	try {
		const data = await fs.readFile(regtextRef, "utf8");
		//jagan failisisu kirjeteks, viimane element on tühi, sest lõpus on semikoolon
		const visits = data.split(";");
		const lastVisit = visits[visits.length - 2];
		//jagan viimase külastuse osadeks: [nimi, kuupäev, kellaaeg]
		const parts = lastVisit.split(",");
		const visitText = "Viimati registreeriti külastus " + parts[1] + ", kell " + parts[2] + " kui seda tegi " + parts[0];
		res.render('viimanekulastus', {visitText: visitText});
	}
	catch (err) {
		console.log(err);
		res.render('viimanekulastus', {visitText: 'Külastusi pole veel registreeritud!'});
	}
});

app.get('/vanasona', async (req, res)=>{
	try {
		const data = await fs.readFile(textRef, "utf8");
		let folkWisdom = data.split(";");
		res.render('vanasona', {wisdom: folkWisdom[Math.round(Math.random() * (folkWisdom.length - 1))]});
	}
	catch (err) {
		console.log(err);
		res.render('vanasona', {wisdom: 'Kahjuks ei leidnud Ã¼htegi vanasÃµna!'});
	}
});


//regvisit marsruut
const regvisitRouter = require('./routes/regvisitRoutes');
app.use('/regvisit', regvisitRouter);


/* app.get('/regvisit', (req, res)=>{
	res.render('regvisit');
});

app.post('/regvisit', async (req, res)=>{
	try {
		const dateNow = dateET.fullDate(0);
		const timeNow = dateET.fullTime();
		await fs.open(regtextRef, 'a');
        await fs.appendFile(regtextRef, req.body.inputName + ',' + dateNow + ',' + timeNow + ';');
        res.render('regvisit');
	}
	catch (err) {
        console.log(err);
		res.render('regvisit');
	}
	
}); */

//Eesti filmi marsruudid
const eestiFilmRouter = require('./routes/eestifilmRoutes');
app.use('/eestifilm', eestiFilmRouter);

/* app.get('/eestifilm', (req, res)=>{
	res.render('eestifilm');
}); */

/* app.get('/eestifilm/inimesed', async (req, res)=>{
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
	
}); */

/* app.get('/eestifilm/inimesed_lisa', (req, res)=>{
	res.render('eestifilminimesed_lisa', {notice: 'Ootan sisestust!', firstName: null, lastName: null, born: null, deceased: null});
}); */

/* app.post('/eestifilm/inimesed_lisa', async (req, res)=>{
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
});

app.get('/eestifilm/filmid_lisa', (req, res)=>{
	res.render('eestifilmfilmid_lisa', {notice: 'Ootan sisestust!', title: null, releaseYear: null, duration: null, description: null});
});

app.post('/eestifilm/filmid_lisa', async (req, res)=>{
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
}); */

/* app.get('/eestifilm/ametid_lisa', (req, res)=>{
	res.render('eestifilmametid_lisa', {notice: 'Ootan sisestust!', title: null, description: null});
});

app.post('/eestifilm/ametid_lisa', async (req, res)=>{
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
}); */

app.listen(5206);