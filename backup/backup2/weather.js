function Weather () {
	var w = this;

	var weatherUrl = 'http://api.openweathermap.org/data/2.5/weather?'; 
	var appid = '&appid=c0a7816b2acba9dbfb70977a1e537369';
	var googleUrl =  'https://maps.googleapis.com/maps/api/geocode/json?address=';
	var googleKey = '&key=AIzaSyBHBjF5lDpw2tSXVJ6A1ra-RKT90ek5bvQ';

	w.weatherInfoDiv = document.getElementsByClassName('weatherInfo')[0];
	w.getWeather = document.getElementsByClassName('getWeather')[0];
	w.addCityBtn = document.getElementsByClassName('addCity')[0];
	w.rmCityBtn = document.getElementsByClassName('rmCity')[0];

	w.lat = null;
	w.lon = null;
	w.weather = null;

	function sendRequest (url, data, callback) {

		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.send();
	
		request.onreadystatechange = function() {
			if (request.readyState == 4 && request.status == 200) {
					data = JSON.parse(request.responseText);
					callback(data);
			} else {
				console.log(request.status + ': ' + request.statusText);
			}
		}
		
	}

	function displayFunc (obj) {

		var newDiv = document.createElement('div');
		newDiv.className = 'city';
		newDiv.innerHTML = 
		"<p> Place: " + obj.name + "</p>" + 
		"<p> Weather: " + obj.weather[0].description + "</p>" + 
		"<p> Temperature: " + w.convertToCels(obj.main.temp) + "°C" + "</p>" + 
		"<p> Wind: " + obj.wind.speed + " meter/sec </p>" + 
		"<p> Humidity: " + obj.main.humidity + '%' + "</p>" + 
		"<img src='" + 'http://openweathermap.org/img/w/' + obj.weather[0].icon + '.png' + "' alt='icon'>"; 

		w.weatherInfoDiv.appendChild(newDiv);
	}


	w.convertToCels = function(temp) {
		var tempC = Math.round(temp - 273.15);
		return tempC;
	}


	w.getWeatherFunc = function() {

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(location){
				w.lat = location.coords.latitude;
				w.lon = location.coords.longitude;

				if(!localStorage.cities) {
					var url = weatherUrl + 'lat=' + w.lat + '&lon=' + w.lon + appid;
					sendRequest(url, w.weather, displayFunc);
				} else {
					var cities = localStorage.cities.split(',');
					console.log(cities);
					for (var i = 0; i < cities.length; i++) {

						var gUrl = googleUrl + cities[i] + googleKey;
						var newCityWeather = null;
						
						sendRequest(gUrl, newCityWeather, function(data){
							var location = data.results[0].geometry.location;
							var newUrl = weatherUrl + 'lat=' + location.lat + '&lon=' + location.lng + appid;
							sendRequest(newUrl, data, displayFunc);
						});
					}
				}
			});

		} else {
			alert('Browser could not find your current location');
		}
	}

	w.addCityBtn.onclick = function() {

		var newCity = prompt('Please insert city', 'Kiev');
		var gUrl = googleUrl + newCity + googleKey;
		var newCityWeather = null;

		sendRequest(gUrl, newCityWeather, function(data){
			var location = data.results[0].geometry.location;
			var newUrl = weatherUrl + 'lat=' + location.lat + '&lon=' + location.lng + appid;
			sendRequest(newUrl, data, displayFunc);
		});

		if (!localStorage.getItem('cities')) {
			localStorage.setItem('cities', newCity);
		} 
		else {
			var cities = localStorage.getItem('cities').split(',');
			cities.push(newCity);
			localStorage.setItem('cities', cities.join());

			console.log(localStorage);
		}
	}

	w.rmCityBtn.onclick = function(city) {
		var cityToRemove = prompt('Which city do you want to remove?');
		var cities = localStorage.getItem('cities').split(',');

		for (var i = 0; i < cities.length; i++) {
			if (cities[i] == cityToRemove) {
				cities.splice(cities.indexOf(cityToRemove), 1);
				localStorage.setItem('cities', cities);
				w.weatherInfoDiv.innerHTML = '';
				w.getWeatherFunc();
			}
		}
	}

	window.onload = w.getWeatherFunc;

	setInterval(function() {
		w.getWeatherFunc();
	}, 900000);

}

