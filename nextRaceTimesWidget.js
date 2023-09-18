const TimeParse = async (time) => {
	const localTime = new Date(time);

	const monthNames = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];

	// function to pad single digit numbers with a zero in order to always have 4 digits in the time
	const padZero = (num) => (num < 10 ? `0${num}` : num);

	// decided to return an object for easier data plotting in the loops
	const desiredFormat = {
		month: monthNames[localTime.getMonth()],
		day: localTime.getDate(),
		hour: padZero(localTime.getHours()),
		minute: padZero(localTime.getMinutes()),
	};

	return desiredFormat;
};

const weatherCheck = async (lat, long, date) => {
	const weatherCheck = await fetch(
		`https://api.weatherapi.com/v1/forecast.json?q=${lat}%2C${long}&days=1&dt=dt%3D${date}&key=${ting}`
	);
	const weatherCheckJson = await weatherCheck.json();

	const weatherData = {
		weatherImg: weatherCheckJson.forecast.forecastday[0].day.condition.icon,
		weatherText: weatherCheckJson.forecast.forecastday[0].day.condition.text,
	};

	return weatherData;
};

const nextRaceTimesWidget = async () => {
	// requesting race day data from the ergast api
	const f1pull = await fetch('http://ergast.com/api/f1/current/next.json');
	const f1pulljson = await f1pull.json();
	const raceData = await f1pulljson.MRData.RaceTable.Races[0];

	//pooling relevant data from the raceData object
	const raceDay = await TimeParse(raceData.date + 'T' + raceData.time);
	const racelat = raceData.Circuit.Location.lat;
	const racelong = raceData.Circuit.Location.long;

	// requesting weather data for race day from the weatherapi
	const raceDayWeather = await weatherCheck(racelat, racelong, raceData.date);

	// section to parse the race events from the raceData object
	const raceKeysToInclude = [
		'FirstPractice',
		'SecondPractice',
		'ThirdPractice',
		'Qualifying',
		'Sprint',
	];
	const raceStages = raceKeysToInclude.reduce((acc, key) => {
		if (raceData[key]) {
			acc.push({
				name: key,
				date: raceData[key].date,
				time: raceData[key].time,
			});
		}
		return acc;
	}, []);

	//

	/* // adding a small title to the widget
	const nxtrace = document.getElementById('nxtrace');
	nxtrace.innerHTML = `${raceData.raceName} 👉🏻 ${raceData.Circuit.circuitName} 🏁 on ${raceDay.day}/${raceDay.month}`; */

	/* // dynamic stage component
	raceStages.forEach(async (stage) => {
		const timeParseTest = await TimeParse(stage.date + 'T' + stage.time);
		const text = document.createElement('p');
		text.classList.add('nxtracetable');
		text.innerHTML = `${timeParseTest.month} ${timeParseTest.day} | ${stage.name} | Your Time ${timeParseTest.hour}:${timeParseTest.minute} | ⛈️`;
		document.getElementById('kitchensink').appendChild(text);
	});
 */
	// dynamic stage component using an html table element
	const table = document.createElement('table');
	const tableHeader = document.createElement('thead');
	const tableBody = document.createElement('tbody');

	table.classList.add('nxtracetable');
	document.getElementById('kitchensink').appendChild(table);

	// Create table header row
	const headerRow = document.createElement('tr');
	headerRow.innerHTML = `<th colspan="3">${raceData.raceName} 👉🏻 ${raceData.Circuit.circuitName} 🏁 </th>`;
	tableHeader.appendChild(headerRow);
	table.appendChild(tableHeader);

	// Create table rows with data
	const dynamicRows = [];

	//chatGPT made me aware of this method, Promise.all() is a way to run multiple async functions at the same time
	await Promise.all(
		raceStages.map(async (item) => {
			const date = item.date;
			const stageWeather = await weatherCheck(racelat, racelong, date);
			const timeParseTest = await TimeParse(date + 'T' + item.time);
			const row = document.createElement('tr');
			row.innerHTML = `<td>${timeParseTest.month} ${timeParseTest.day}</td><td>${item.name}</td><td>${timeParseTest.hour}:${timeParseTest.minute}</td><td><img src='https:${stageWeather.weatherImg}' alt="weather img icon"></td><td> <p>${stageWeather.weatherText}</p></td>`;
			dynamicRows.push(row);
		})
	);

	// adding the dynamic rows to the table body
	dynamicRows.forEach((row) => {
		tableBody.appendChild(row);
	});

	console.log(dynamicRows);

	table.appendChild(tableBody);

	// adding the main race event to the bottom of the table body element
	const racedayrow = document.createElement('tr');
	racedayrow.innerHTML = `<td>${raceDay.month} ${raceDay.day}</td><td><p>MainEvent</p></td><td>${raceDay.hour}:${raceDay.minute}</td><td><img src='https:${raceDayWeather.weatherImg}' alt="weather img icon"></td><td> <p>${raceDayWeather.weatherText}</p></td>`;
	tableBody.appendChild(racedayrow);

	// adding the table footer
	const tableFooter = document.createElement('tfoot');
	const footerRow = document.createElement('tr');
	footerRow.classList.add('localtimetext');
	footerRow.innerHTML = `<th colspan="6">All shown times are your local time</th>`;
	tableFooter.appendChild(footerRow);
	table.appendChild(tableFooter);

	//end of the script
};

nextRaceTimesWidget();
