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
//mÃ¤Ã¤rame vormide sisu parsimise, kui false siis ainult tekst
app.use(bodyparser.urlencoded({extended: true}));

//marsruudid
app.get('/', async (req, res)=>{
	const dayNow = dateET.day();
	const dateNow = dateET.fullDate(0);
	const timeNow = dateET.fullTime();

	//vaikeväärtused, kui avalikku pilti pole või andmebaasiga tekib viga
	let photoFile = null;
	let photoAlt = 'Uusim avalik foto';

	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const sqlReq = 'SELECT filename, alttext FROM galleryphotos WHERE id=(SELECT MAX(id) FROM galleryphotos WHERE privacy=? AND deleted IS NULL)';
		const [sqlRes] = await conn.execute(sqlReq, [3]);
		if(sqlRes.length > 0){
			photoFile = sqlRes[0].filename;
			if(sqlRes[0].alttext){
				photoAlt = sqlRes[0].alttext;
			}
		}
	}
	catch(err) {
		console.log('Avalehe foto lugemise viga: ' + err);
	}
	finally {
		if(conn){
			await conn.end();
		}
	}

	res.render('index', {dayNow: dayNow, dateNow: dateNow, timeNow: timeNow, photoFile: photoFile, photoAlt: photoAlt});
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

//sisseloginud kasutajate leht
app.get('/home', async (req, res) => {
	//vaikeväärtused, kui avalikku pilti pole või andmebaasiga tekib viga
	let photoFile = null;
	let photoAlt = 'Uusim avalik foto';

	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const sqlReq = 'SELECT filename, alttext FROM galleryphotos WHERE id=(SELECT MAX(id) FROM galleryphotos WHERE privacy=? AND deleted IS NULL)';
		const [sqlRes] = await conn.execute(sqlReq, [2]);
		if(sqlRes.length > 0){
			photoFile = sqlRes[0].filename;
			if(sqlRes[0].alttext){
				photoAlt = sqlRes[0].alttext;
			}
		}
	}
	catch(err) {
		console.log('Avalehe foto lugemise viga: ' + err);
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
})

//väljalogimine
app.get('/logout', (req, res) => {
	res.redirect('/');
})


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


//Eesti filmi marsruudid
const eestiFilmRouter = require('./routes/eestifilmRoutes');
app.use('/eestifilm', eestiFilmRouter);

//regvisit marsruut
const regvisitRouter = require('./routes/regvisitRoutes');
app.use('/regvisit', regvisitRouter);

//galeriipiltide üleslaadimine
const galleryPhotoUploadRouter = require('./routes/galleryPhotoUploadRoutes');
app.use('/galleryPhotoUpload', galleryPhotoUploadRouter);

//galerii marsruut
const galleryRouter = require('./routes/galleryRoutes');
app.use('/photogallery', galleryRouter);

//kasutajakonto loomise marsruut
const signupRouter = require('./routes/signupRoutes');
app.use('/signup', signupRouter);


//Sisselogimine
const signinRouter = require('./routes/signinRoutes');
app.use('/signin', signinRouter);


app.listen(5206);