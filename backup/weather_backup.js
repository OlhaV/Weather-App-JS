function Weather () {
	var w = this;

	var weatherUrl = 'http://api.openweathermap.org/data/2.5/weather?'; 
	var appid = '&appid=c0a7816b2acba9dbfb70977a1e537369';
	var googleUrl =  'https://maps.googleapis.com/maps/api/geocode/json?address=';
	var googleKey = '&key=AIzaSyBHBjF5lDpw2tSXVJ6A1ra-RKT90ek5bvQ';

	w.weatherInfoDiv = document.getElementsByClassName('weatherInfo')[0];
	w.place = document.getElementsByClassName('place')[0];
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
		"<p class='place'> Place: " + obj.name + "</p>" + 
		"<p class='weather'> Weather: " + obj.weather[0].description + "</p>" + 
		"<p class='temp'> Temperature: " + w.convertToCels(obj.main.temp) + "°C" + "</p>" + 
		"<p class='wind'> Wind: " + obj.wind.speed + " meter/sec </p>" + 
		"<p class='humid'> Humidity: " + obj.main.humidity + '%' + "</p>" + 
		"<img src='" + 'http://openweathermap.org/img/w/' + obj.weather[0].icon + '.png' + "' alt='icon' class='icon'>"; 

		w.weatherInfoDiv.appendChild(newDiv);
	}


	w.convertToCels = function(temp) {
		var tempC = Math.round(temp - 273.15);
		return tempC;
	}


	w.getWeatherFunc = function() {

	// in case localStorage is empty, we get weather for current user's location 
		if(!localStorage.cities) {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(location){
					w.lat = location.coords.latitude;
					w.lon = location.coords.longitude;
					var curentLocationWeather = null;

					var url = weatherUrl + 'lat=' + w.lat + '&lon=' + w.lon + appid;
					sendRequest(url, curentLocationWeather, function(data) {
						displayFunc(data);
						localStorage.setItem('cities', data.name);
					});
				});
			} 

			else {
				alert('Browser could not find your current location');
		 	}
		}

	// in case there are items in localStorage, we get weather for each of them  
		else {
			var cities = localStorage.cities.split(',');

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

