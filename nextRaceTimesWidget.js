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

	const desiredFormat = {
		month: monthNames[localTime.getMonth()],
		day: localTime.getDate(),
		hour: localTime.getHours(),
		minute: localTime.getMinutes(),
	};

	return desiredFormat;
};

const nextRaceTimesWidget = async () => {
	const f1pull = await fetch('http://ergast.com/api/f1/current/next.json');
	const f1pulljson = await f1pull.json();
	const raceData = await f1pulljson.MRData.RaceTable.Races[0];
	const raceDay = await TimeParse(raceData.date);
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

	// gathering the array to breakdown and display
	console.log(raceStages);

	/* // single stage component for now
	const timeParseTest = await TimeParse(
		raceStages[0].date + 'T' + raceStages[0].time
	);
	const text = document.createElement('p');
	text.innerHTML = `${timeParseTest.month} ${timeParseTest.day} | ${raceStages[0].name} | Your Time ${timeParseTest.hour}:${timeParseTest.minute} | ⛈️`; 
	document.getElementById('kitchensink').appendChild(text);*/

	/* // adding a small title to the widget
	const nxtrace = document.getElementById('nxtrace');
	nxtrace.innerHTML = `${raceData.raceName} 👉🏻 ${raceData.Circuit.circuitName} 🏁 on ${raceDay.day}/${raceDay.month}`; */

	/* // dynamic stage component
	raceStages.forEach(async (stage) => {
		const timeParseTest = await TimeParse(stage.date + 'T' + stage.time);
		const text = document.createElement('p');
		text.innerHTML = `${timeParseTest.month} ${timeParseTest.day} | ${stage.name} | Your Time ${timeParseTest.hour}:${timeParseTest.minute} | ⛈️`;
		document.getElementById('kitchensink').appendChild(text);
	}); */

	// dynamic stage component using an html table element
	const table = document.createElement('table');
	const tableHeader = document.createElement('thead');
	const tableBody = document.createElement('tbody'); // Add this line to create the table body

	table.classList.add('nxtracetable');
	document.getElementById('kitchensink').appendChild(table);

	// Create table header row
	const headerRow = document.createElement('tr');
	headerRow.innerHTML = `<th colspan="3">${raceData.raceName} 👉🏻 ${raceData.Circuit.circuitName} 🏁 on ${raceDay.day}/${raceDay.month}</th>`;
	tableHeader.appendChild(headerRow);
	table.appendChild(tableHeader);

	// Create table rows with data
	raceStages.forEach(async (item) => {
		const timeParseTest = await TimeParse(item.date + 'T' + item.time);
		const row = document.createElement('tr');
		row.innerHTML = `<td>${timeParseTest.month} ${timeParseTest.day}</td><td>${item.name}</td><td>Your Time ${timeParseTest.hour}:${timeParseTest.minute}</td><td>⛈️</td>`;
		tableBody.appendChild(row);
	});

	table.appendChild(tableBody);
};

nextRaceTimesWidget();
