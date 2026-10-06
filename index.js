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

app.get('/regvisit', (req, res)=>{
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
	
});

app.get('/eestifilm', (req, res)=>{
	res.render('eestifilm');
});

app.get('/eestifilm/inimesed', async (req, res)=>{
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
	
});

app.get('/eestifilm/inimesed_lisa', (req, res)=>{
	res.render('eestifilminimesed_lisa', {notice: 'Ootan sisestust!'});
});

app.post('/eestifilm/inimesed_lisa', async (req, res)=>{
	console.log(req.body);
	//kontrollime andmeid
	//sisestatud sünnikuupäev (tekst) teisendada kuupäevaks
	const bornDate = new Date(req.body.bornInput);
	const timeNow = new Date();
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.bornInput || isNaN(bornDate.getTime() || bornDate > timeNow)) {
		console.log("Andmed pole korrektsed!");
		return res.render('eestifilminimesed_lisa');
	}
	let deceasedDate = null;
	if(req.body.deceasedInput != ''){
		deceasedDate = req.body.deceasedInput;
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
		res.render('eestifilminimesed_lisa' , {notice: req.body.firstNameInput + req.body.lastNameInput + ' andmebaasi lisatud!'});
	}
	catch (err){
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilminimesed_lisa' , {notice: 'andmebaasi ei lisatud midagi'});

	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

app.listen(5206);