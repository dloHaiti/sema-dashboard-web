"use strict";

const API_BASE_URL = 'http://dlo.semawater.org/';

// 10 minutes sync interval
const DEFAULT_SYNC_INTERVAL = 10 * 60;

// Last time dashboard has been refreshed
// let LAST_REFRESHED_TIME = new Date.now();


// Initialize our chart data
const actualMonth = new Date().getMonth() + 1;
const actualYear = new Date().getFullYear();
const daysInMonth = getDaysInMonth(actualMonth, actualYear);
const lastDayInMonth = daysInMonth[daysInMonth.length - 1];
const params = {
	beginDate: "2019-07-01", // moment().startOf('month').format('YYYY-MM-DD'),
	endDate: "2019-08-01"// moment().endOf('month').format('YYYY-MM-DD')
};


// Declare goal and minGoal as global
let updatedVolume = null,
	goal = null,
	minGoal = null;
// Initialize dashboard variables
const currentPath = {
			yAxisID: 'Y1',
			label: 'Volim Dlo Aktyèl',
			backgroundColor: 'rgba(1, 1, 1, 0)',
			borderColor: '#4471c4',
			borderWidth: 3,
			radius: 3,
			data: null,
			fill: 'start',
		},
		goalPath = {
			yAxisID: 'Y1',
			label: 'Wout Objektif',
			backgroundColor: 'rgba(1, 1, 1, 0)',
			borderColor: '#54b150',
			borderWidth: 1,
			borderDash: [10, 10],
			radius: 0,
			// data: [{x: 0,y: 0}, {x: lastDayInMonth,y: 88000}]
			data: null,
		},
		goalBar = {
			yAxisID: 'Y1',
			label: 'Objektif',
			backgroundColor: 'rgba(1, 1, 1, 0)',
			borderColor: '#54b150',
			borderWidth: 2,
			radius: 0,
			// [{x: 0,y: 88000}, {x: lastDayInMonth,y: 88000}]
			data: null,
		},
		profitBar = {
			yAxisID: 'Y1',
			label: 'Objektif Minimum',
			backgroundColor: 'rgba(1, 1, 1, 0)',
			borderColor: '#facb35',
			borderWidth: 2,
			radius: 0,
			// [{x: 0,y: 62000}, {x: lastDayInMonth,y: 62000}]
			data: null,
		},
	// Duplicate of currentPath to (trick) display of  'Bonus in HTG' on second axis
		currentPathHTG = {
			yAxisID: 'Y2',
			label: '',
			radius: 0,
			showLine: false,
			data: null
		},
		chartOptions = {
			scales: {
				yAxes: [{
					type: 'linear',
					display: true,
					position: 'left',
					id: 'Y1',
					ticks: {
						autoSkip: false,
						min: 0,
						minRotation: 10,
					}
				}, {
					type: 'linear',
					display: true,
					position: 'right',
					id: 'Y2',
					ticks: {
						min: 0,
						minRotation: 10,
						// Include a dollar sign in the ticks
						callback: function (value, index, values) {
							let profit =  calculateBonus(value, goal, minGoal);
							return (profit == 0 ? "" : profit + " HTG");
						},
					},
					// grid line settings
					gridLines: {
						drawOnChartArea: false, // only want the grid lines for one axis to show up
					},
				}],
			}
		};

$(window).on("load", function() {

	// Refresh the date and time every second for live time and as well as connectivity status
	setInterval(refresh, 1000);

	if(params.siteName = validateURL()){
		// Update kiosk name on dashboard
		$('#kiosk-name').text(params.siteName);

		// Select the canvas for our chart
		let canvas = $("#canvas")[0],
			ctx = canvas.getContext('2d');

		// Setup our chart here
		Chart.defaults.global.elements.line.tension = 0.1;
		const chart = new Chart(ctx, {
			// The type of chart we want to create
			type: 'line',

			// The data for our dataset
			data: {
				labels: daysInMonth,
				datasets: [goalBar, goalPath, profitBar, currentPath, currentPathHTG]
			},

			// Configuration options go here
			options: chartOptions
		});

		fetchDashboardData(params, chart);
	}

});

// Refresh app locally
function refresh() {
	// Update the time and date
	$("#date").html(getTimeAndDate());
	// Update connectivity status
	if (!navigator.onLine){
		$('#offline-status').show();
	}else{
		$('#offline-status').hide();
	}
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

// Valid URL contains kiosk parameter. isValid, return kiosk name. Otherwise, null
function validateURL(){
	const urlParams = new URLSearchParams(location.search),
		kiosk = urlParams.get('k') || urlParams.get('kiosk');
	// There is no kiosk parameter; invalid URL
	if(!kiosk)
		confirm("Pa gen kyòsk nan lyen an. SVP, mete yon kyòsk konsa: .../?k=cabaret");
	return kiosk;
}

// Fetch kiosk number from SEMA
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

				let recordCount = 0;

				// On days when kiosks don't open we make sure we set the last set value
				// So that the line stays horizontal. Also, we don't display anything
				// after the last day with records.
				const newData = labels.map((day, idx) => {
					if (availableDays.includes(day)) {
						updatedVolume += response.dailyVolume[day];

						recordCount++;

						return updatedVolume;
					} else if (recordCount >= availableDays.length) {
						return null;
					}

					return updatedVolume;
				});

				// We update the bar values, the card values and update the chart
				goal = getSettingsValue(response.settings, 'monthly_goal');
				minGoal = getSettingsValue(response.settings, 'min_monthly_goal');
				const marginY = Math.max(goal, updatedVolume) * 1.2;

				$('#water-volume').text(updatedVolume);
				$('#goal').text(goal);
				$('#bonus').text(Number(parseFloat(calculateBonus(updatedVolume, goal, minGoal)).toFixed(2)));

				// Index ordered as follow: [goal, goalPath, bar, currentPath, currentPathHTG]
				chart.data.datasets[0].data = [{ x: 0,y: goal}, {x: lastDayInMonth,y: goal }];  // Goal
				chart.data.datasets[1].data = [{x: 0,y: 0}, {x: lastDayInMonth,y: goal}];   // goalPath
				chart.data.datasets[2].data = [{ x: 0,y: minGoal}, {x: lastDayInMonth,y: minGoal }];    // bar
				chart.data.datasets[3].data = chart.data.datasets[4].data = newData;  // currentPath & currentPathHTG

				chart.options.scales.yAxes[0].ticks.max = chart.options.scales.yAxes[1].ticks.max = marginY;

				chart.update();
                // LAST_REFRESHED_TIME = new Date.now();
				resolve();
			})
			.catch(err => {
				throw err;
			});
	});
}

// So the formula goes:
// If Total Volume < Bar, then Bonus = 0
// If Bar < Total Volume < Goal, then Bonus = (Total Volume-Bar)/5
// IF Total Volume>Goal, then Bonus = (Total Volume-Bar)/5 + (Total Volume-Goal)/5*2 + 1000
function calculateBonus(currentVolume, goal, bar) {

	if (currentVolume < bar) return 0;
	else if (currentVolume < goal) return (currentVolume - bar) / 5;
	else return ((currentVolume - bar) / 5) + ((currentVolume - goal) / (5 * 2)) + 1000;
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
		monthsList = ["Jav", "Fev", "Mar", "Avr", "Me", "Jwn", "Jiy", "Out", "Sep", "Okt", "Nov", "Des"],
		daysList = [];
	// Creating day list for the specified month
	for(let i=0; i<daysTotal; i++){
		daysList.push(`${monthsList[month - 1]} ${i + 1}`);
	}
	return daysList;

};

