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
	const raceKeysToInclude = [
		'FirstPractice',
		'SecondPractice',
		'ThirdPractice',
		'Qualifying',
		'Sprint',
	];
	const raceStages = raceKeysToInclude.reduce((acc, key) => {
		if (raceData[key]) {
			acc.push(raceData[key]);
		}
		return acc;
	}, []);

	const timeParseTest = await TimeParse(
		raceStages[0].date + 'T' + raceStages[0].time
	);
	console.log(timeParseTest);

	const text = document.createElement('p');

	text.innerHTML = `testing time parser: ${timeParseTest.month} ${timeParseTest.day}`;

	document.getElementById('kitchensink').appendChild(text);
};

nextRaceTimesWidget();
