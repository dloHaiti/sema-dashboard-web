// JavaScript Document
"use strict";

$(window).on("load", function(){
	
	let canvas = $("#canvas")[0],
		ctx = canvas.getContext('2d');
	
	// Intialize our chart data
	let daysInMonth = getDaysInMonth(new Date().getMonth() + 1, new Date().getYear()),
		lastDayInMonth = daysInMonth[daysInMonth.length - 1],
		goal = {
			label: 'Goal Bar',
			backgroundColor: 'rgba(1, 1, 1, 0)',
			borderColor: '#54b150',
			borderWidth: 5,
			data: [{x: 0,y: 88000}, {x: lastDayInMonth,y: 88000}]
		},
		goalPath = {
			label: '',
			backgroundColor: 'rgba(1, 1, 1, 0)',
			borderColor: '#54b150',
			borderWidth: 1,
			borderDash: [10, 10],
			data: [{x: 0,y: 0}, {x: lastDayInMonth,y: 88000}]
		},
		bar = {
			label: 'Bar',
			backgroundColor: 'rgba(1, 1, 1, 0)',
			borderColor: '#facb35',
			borderWidth: 5,
			data: [{x: 0,y: 62000}, {x: lastDayInMonth,y: 62000}]
		},
		actual = {
			label: 'Actual Water Volume',
			backgroundColor: 'rgba(1, 1, 1, 0)',
			borderColor: '#4471c4',
			borderWidth: 5,
			data: [410, 5000, 12350]
		};
	// Configure the chart
	Chart.defaults.global.elements.point.pointStyle = 'line';
	// Setup our chart here
	let chart = new Chart(ctx, {
		// The type of chart we want to create
		type: 'line',

		// The data for our dataset
		data: {
			labels: daysInMonth,
			datasets: [goal, goalPath, bar, actual]
		},

		// Configuration options go here
		options: {}
	});
	
	// return current time and date
	var getTimeAndDate = function(){
		var spDate = "/";
		var spTime = ":";
		
		var today = new Date();
		// Building date (formatted)
		var dd = today.getDate();
		var mm = today.getMonth()+1; //As January is 0.
		var yyyy = today.getFullYear();
		var date = mm+spDate+dd+spDate+yyyy;
		// Building time
		var hr = today.getHours();
		var mn = today.getMinutes();
		var sc = today.getSeconds();
		var time = hr+spTime+mn+spTime+sc;

		if(dd<10) dd='0'+dd;
		if(mm<10) mm='0'+mm;
		
		return ("<span class=\"date-data\">" + date + "</span> <span class=\"date-data\">" + time +"</span>");
	};
	
	var refresh = function(){
		$("#date").html(getTimeAndDate());
	};
	
	// Refresh the dashboard every second
	var intervalID = setInterval(refresh, 1*1000);
});




/* HELPER FUNCTIONS */
var getDaysInMonth = function(month, year){
	// Total days in month
	let monthList= [],
		daysTotal = new Date(year, month, 0).getDate(),
		monthsList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
		daysList = [];
	// Creating days list for the specified month
	for(var i=0; i<daysTotal; i++){
		daysList.push(
			i+1 /*date*/ + "-" + monthsList[month] /*month*/ + "-" + year
			
		);
	}
	return daysList;
	
};

