// JavaScript Document
"use strict";

$(window).on("load", function() {

	var urlParams = new URLSearchParams(location.search);

	if (!urlParams.has('k') && !urlParams.has('kiosk')) {
		confirm("No kiosk set! Please, set kiosk in the URL. (i.e.: .../?k=cabaret");
		location.reload();
	} else {
		params.siteName = urlParams.get('k') || urlParams.get('kiosk');
		$('#kiosk-name').text(params.siteName);
	}

	let canvas = $("#canvas")[0],
		ctx = canvas.getContext('2d');

	// Configure the chart
	Chart.defaults.global.elements.point.pointStyle = 'line';

	// Setup our chart here
	const chart = new Chart(ctx, {
		// The type of chart we want to create
		type: 'line',

		// The data for our dataset
		data: {
			labels: daysInMonth,
			datasets: [goal, goalPath, bar, currentWaterVolume]
		},

		// Configuration options go here
		options: {}
	});
	
	// Refresh the date and time every second for live time
	setInterval(refresh, 1000);

	// Pull new data when ready
	fetchDashboardData(params, chart);

	// Pull new data every 5 minutes
	// setInterval(() => {
	// 	fetchDashboardData(params, chart);
	// }, 5*60*1000);
});

const API_BASE_URL = '/';

const params = {
	beginDate: moment().startOf('month').format('YYYY-MM-DD'),
	endDate: moment().endOf('month').format('YYYY-MM-DD')
};

// Intialize our chart data
const daysInMonth = getDaysInMonth(new Date().getMonth(), new Date().getFullYear()),
	lastDayInMonth = daysInMonth[daysInMonth.length - 1];

const currentWaterVolume = {
			label: 'Current Water Volume',
			backgroundColor: 'rgba(1, 1, 1, 0)',
			borderColor: '#4471c4',
			borderWidth: 5,
			data: null
		},
		goal = {
			label: 'Goal',
			backgroundColor: 'rgba(1, 1, 1, 0)',
			borderColor: '#54b150',
			borderWidth: 5,
			data: [{x: 0,y: 88000}, {x: lastDayInMonth,y: 88000}]
		},
		goalPath = {
			label: 'Goal Path',
			backgroundColor: 'rgba(1, 1, 1, 0)',
			borderColor: '#54b150',
			borderWidth: 1,
			borderDash: [10, 10],
			data: [{x: 0,y: 0}, {x: lastDayInMonth,y: 88000}]
		},
		bar = {
			label: 'Minimum Goal',
			backgroundColor: 'rgba(1, 1, 1, 0)',
			borderColor: '#facb35',
			borderWidth: 5,
			data: [{x: 0,y: 62000}, {x: lastDayInMonth,y: 62000}]
		};

function refresh() {
	$("#date").html(getTimeAndDate());
};

// return current time and date
function getTimeAndDate() {
	const spDate = "/";
	const spTime = ":";
	
	const today = new Date();
	// Building date (formatted)
	let dd = today.getDate();
	let mm = today.getMonth()+1; //As January is 0.
	const yyyy = today.getFullYear();
	const date = mm+spDate+dd+spDate+yyyy;
	// Building time
	const hr = today.getHours();
	const mn = today.getMinutes();
	const sc = today.getSeconds();
	const time = hr+spTime+mn+spTime+sc;

	if(dd<10) dd='0'+dd;
	if(mm<10) mm='0'+mm;
	
	return ("<span class=\"date-data\">" + date + "</span> <span class=\"date-data\">" + time +"</span>");
};

function fetchDashboardData(params, chart) {
	return new Promise((resolve, reject ) => {
		let url = 'dataset/dashboard?siteName=' + params.siteName;

		url = url + "&beginDate=" + params.beginDate;
		url = url + "&endDate=" + params.endDate;

		fetch(`${API_BASE_URL}${url}`)
			.then(response => response.json())
			.then(response => {
				// Make sure the right kiosk is set during configuration
				if (response.status === 404) {
					alert(response.msg);
					location.reload();
				}

				// We update the dataset on server response
				const availableDays = Object.keys(response.dailyVolume),
					labels = chart.data.labels;

				let latestVolume = 0;
				let recordCount = 0;

				// On days when kiosks don't open we make sure we set the last set value
				// So that the line stays horizontal. Also, we don't display anything
				// after the last day with records.
				const newData = labels.map((day, idx) => {
					if (availableDays.includes(day)) {
						latestVolume += response.dailyVolume[day];

						recordCount++;

						return latestVolume;
					} else if (recordCount >= availableDays.length) {
						return null;
					}

					return latestVolume;
				});

				// We update the bar values, the card values and update the chart
				const goal = getSettingsValue(response.settings, 'monthly_goal')
				const minGoal = getSettingsValue(response.settings, 'min_monthly_goal')

				$('#water-volume').text(latestVolume);
				$('#goal').text(goal);
				// $('#bonus').text(calculateBonus(latestVolume, response));

				chart.data.datasets[3].data = newData;
				chart.data.datasets[0].data = [{ x: 0,y: goal}, {x: lastDayInMonth,y: goal }];
				chart.data.datasets[2].data = [{ x: 0,y: minGoal}, {x: lastDayInMonth,y: minGoal }];
				chart.data.datasets[1].data = [{x: 0,y: 0}, {x: lastDayInMonth,y: goal}]

				chart.update();
			})
			.catch(err => {
				reject(err);
			});
	});
}

function getSettingsValue(settings, settingsName) {
	return settings.reduce((final, item) => {
		if (item.name === settingsName) return item.value;
		return final;
	}, 0);
}

function getDaysInMonth(month, year) {
	// Total days in month
	let monthList= [],
		daysTotal = new Date(year, month, 0).getDate(),
		monthsList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
		daysList = [];
	// Creating days list for the specified month
	for(var i=0; i<daysTotal; i++){
		daysList.push(`${monthsList[month]} ${i + 1}`);
	}
	return daysList;
	
};

