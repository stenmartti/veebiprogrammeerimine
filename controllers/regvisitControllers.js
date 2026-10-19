const mysql = require('mysql2/promise');

//@desc page for registering your visit
//@route GET /regvisit
//@access public

//app.get('/regvisit', (req, res)=>{
const regvisit = (req, res) => {
	res.render('regvisit');
};

//app.post('/regvisit', async (req, res)=>{
const regvisitPost = async (req, res) => {
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
	
};

module.exports = {
    regvisit,
    regvisitPost
}