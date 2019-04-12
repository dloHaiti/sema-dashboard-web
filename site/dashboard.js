// JavaScript Document
"use strict";

$(window).on("load", function(){
	
	let canvas = $("#canvas")[0],
		ctx = canvas.getContext('2d');
	
	// Setup our char here
	var chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [0, 20000, 40000, 60000, 80000, 100000, 120000, 140000],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});
	
	var getTimeAndDate = function(){
		var spDate = "/";
		var spTime = ":";
		
		var today = new Date();
		// Building date (formatted)
		var dd = today.getDate();
		var mm = today.getMonth()+1; //As January is 0.
		var yyyy = today.getYear();
		var date = mm+spDate+dd+spDate+yyyy;
		// Building time
		var hr = today.getHours();
		var mn = today.getMinutes();
		var sc = today.getSeconds();
		var time = hr+spTime+mn+spTime+sc;

		if(dd<10) dd='0'+dd;
		if(mm<10) mm='0'+mm;
		
		return ("<span class=\"p-2\">" + date + "</span> <span class=\"p-2\">" + time +"</span>");
	};
	
	var refresh = function(){
		$("#date").html(getTimeAndDate());
	};
	
	// Refresh the dashboard every second
	var intervalID = setInterval(refresh, 1*1000);
});
