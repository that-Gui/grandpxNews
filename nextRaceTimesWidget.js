// function to convert racetimes to local time after cdn snapshot
const handleTime = async () => {
	const dateElements = document.querySelectorAll('.stagedate');

	for (const item of dateElements) {
		const time = item.innerHTML;
		const timeParsed = await TimeParse(time);
		item.innerHTML = `${timeParsed.month} ${timeParsed.day}`;
	}

	const timeElements = document.querySelectorAll('.stagetime');

	for (const item of timeElements) {
		const time = item.innerHTML;
		const timeParsed = await TimeParse(time);
		item.innerHTML = `${timeParsed.hour}:${timeParsed.minute}`;
	}

	// function to pad single digit numbers with a zero in order to always have 4 digits in the time
	const padZero = (num) => (num < 10 ? `0${num}` : num);
	// this is the part that should run constantly like a clock
	const secondsElements = document.querySelectorAll('.yourtime');
	setInterval(() => {
		const localTime = new Date();
		const localTimeParsed = {
			hour: padZero(localTime.getHours()),
			minute: padZero(localTime.getMinutes()),
			second: padZero(localTime.getSeconds()),
		};

		secondsElements.forEach((item) => {
			item.innerHTML = `${localTimeParsed.hour}:${localTimeParsed.minute}:${localTimeParsed.second}`;
		});
	}, 1000);

	// target all elemnts with class itemstoclose and change the class to itemstoopen
	const closeElements = document.querySelectorAll('.itemstoopen');
	closeElements.forEach((item) => {
		item.classList.remove('itemstoopen');
		item.classList.add('itemstoclose');
	});

	// removing the button after it has been clicked
	const tableOpenButton = document.querySelector('.tableopen');
	tableOpenButton.remove();

	// adding the button to close the table
	const tableCloseButton = document.createElement('span');
	tableCloseButton.classList.add('tableclose');
	tableCloseButton.innerHTML = `<button onclick="handleClose()" id='togglebtn'>CLOSE</button>`;
	document.querySelector('.headerrow').appendChild(tableCloseButton);
};

// function to toggle the table open and close state using the class names
const handleClose = () => {
	const togglebtn = document.getElementById('togglebtn');

	if (togglebtn.innerHTML === 'CLOSE') {
		togglebtn.innerHTML = 'GO';

		const openElements = document.querySelectorAll('.itemstoclose');
		openElements.forEach((item) => {
			item.classList.remove('itemstoclose');
			item.classList.add('itemstoopen');
		});
	} else {
		togglebtn.innerHTML = 'CLOSE';

		const closeElements = document.querySelectorAll('.itemstoopen');
		closeElements.forEach((item) => {
			item.classList.remove('itemstoopen');
			item.classList.add('itemstoclose');
		});
	}
};

// timeparse function expects a time string in the format of 2021-07-18T14:00:00Z
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

const ting = 'f1f1f1f1f1';

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
	const f1pull = await fetch('https://ergast.com/api/f1/current/next.json');
	const f1pulljson = await f1pull.json();
	const raceData = await f1pulljson.MRData.RaceTable.Races[0];

	//pooling relevant data from the raceData object
	const raceDay = raceData.date + 'T' + raceData.time;
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

	// dynamic stage component using an html table element
	const table = document.createElement('table');
	const tableHeader = document.createElement('thead');
	const tableBody = document.createElement('tbody');

	table.classList.add('nxtracetable');
	tableBody.classList.add('itemstoopen');

	document.getElementById('kitchensink').appendChild(table);

	// Create table header row
	const headerRow = document.createElement('tr');
	headerRow.innerHTML = `<th colspan="5" class='headerrow'>${raceData.raceName} 👉🏻 ${raceData.Circuit.circuitName} 🏁 <span class='tableopen'><button onclick="handleTime()">GO</button></span> </th>`;
	tableHeader.appendChild(headerRow);
	table.appendChild(tableHeader);

	// Create table rows with data
	const dynamicRows = [];

	//chatGPT made me aware of this method, Promise.all() is a way to run multiple async functions at the same time
	await Promise.all(
		raceStages.map(async (item, index) => {
			const date = item.date;
			const stageWeather = await weatherCheck(racelat, racelong, date);
			const stageTime = date + 'T' + item.time;
			const row = document.createElement('tr');
			row.setAttribute('data-key', `row-${index}`);
			row.innerHTML = `<td class='stagedate'>${stageTime}</td><td>${item.name}</td><td><i class="fa-regular fa-clock"></i><span class='stagetime'>${stageTime}</span></td><td><img src='https:${stageWeather.weatherImg}' alt="weather img icon">${stageWeather.weatherText}</td>`;
			dynamicRows.push(row);
		})
	);

	// sorting the dynamic rows by date + time before adding them to the table body
	dynamicRows.sort((a, b) => {
		const aDate = a.getAttribute('data-key');
		const bDate = b.getAttribute('data-key');
		return aDate.localeCompare(bDate);
	});

	// adding the dynamic rows to the table body
	dynamicRows.forEach((row) => {
		tableBody.appendChild(row);
	});

	table.appendChild(tableBody);

	// adding the main race event to the bottom of the table body element
	const racedayrow = document.createElement('tr');
	racedayrow.innerHTML = `<td class='stagedate'>${raceDay}</td><td>Race</td><td><i class="fa-regular fa-clock"></i><span class='stagetime'>${raceDay}</span></td><td><img src='https:${raceDayWeather.weatherImg}' alt="weather img icon"> ${raceDayWeather.weatherText}</td>`;
	tableBody.appendChild(racedayrow);

	// adding the table footer with the user local time which should run constatnly like a clock
	const tableFooter = document.createElement('tfoot');
	const footerRow = document.createElement('tr');
	footerRow.innerHTML = `<td colspan='5' class='itemstoopen'>All times are displayed in your local time | Your time <i class="fa-regular fa-clock"></i><span class='yourtime'></span></td>`;
	tableFooter.appendChild(footerRow);
	table.appendChild(tableFooter);

	//end of the script
};

nextRaceTimesWidget();
