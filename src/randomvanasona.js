
const RandomVanasona = async function(req, res){ 
    const fs = require('fs').promises;
    const textRef = 'txt/vanasonad.txt';
    const rawText = await fs.readFile(textRef, 'utf8');
    let folkWisdom = rawText.split(';');
    let suvalinevanasona = folkWisdom[Math.round(Math.random() * (folkWisdom.length - 1))];
    res.write(`<p>Loositud vanasõna: ${suvalinevanasona}</p>`);
}
module.exports = {RandomVanasona: RandomVanasona};