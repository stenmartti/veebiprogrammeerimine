const dateFormattedET = function(opt){
	let timeNow = new Date();
	let monthNamesET = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'];
	if(opt == 1){
		monthNamesET = ['näärikuu', 'küünlakuu', 'paastukuu', 'jürikuu', 'lehekuu', 'jaanikuu', 'heinakuu', 'lõikuskuu', 'mihklikuu', 'viinakuu', 'talvekuu', 'jõulukuu'];
	}
	return timeNow.getDate() + '. ' + monthNamesET[timeNow.getMonth()] + ' ' + timeNow.getFullYear();
}

const addLeadZero = function(numValue){
	if(numValue < 10){
		numValue = '0' + numValue;
	}
	return numValue;
}

const timeFormattedET = function(){
	let timeNow = new Date();
	let hourNow = timeNow.getHours();
	let minuteNow = timeNow.getMinutes();
	let secondNow = timeNow.getSeconds();
	let timeFormatted = hourNow + ':' + addLeadZero(minuteNow) + ':' + addLeadZero(secondNow);
	return timeFormatted;
}

const weekdayET = function(){
	let weekDay = new Date().getDay();
	const weekdayNamesET = ['pühapäev', 'esmaspäev', "teisipäev", 'kolmapäev', 'neljapäev', 'reede', 'laupäev'];
	return weekdayNamesET[weekDay];
}

//ekspordin kõik vajaliku
module.exports = {fullDate: dateFormattedET, fullTime: timeFormattedET, day: weekdayET}