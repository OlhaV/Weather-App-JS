function Weather () {

	var w = this;

	var weatherUrl = 'http://api.openweathermap.org/data/2.5/weather?'; 
	var appid = '&appid=c0a7816b2acba9dbfb70977a1e537369';
	var googleUrl =  'https://maps.googleapis.com/maps/api/geocode/json?language=en&address=';
	var googleKey = '&key=AIzaSyBHBjF5lDpw2tSXVJ6A1ra-RKT90ek5bvQ';
	var regE = /[A-Za-z]/;

	var city = {
		name: null,
		coord: {
			lat: 0,
			lon: 0
		}
	}

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
				console.log(request.status);
			}
		}
	}

	function displayFunc (obj, name) {

		this.name = name;
		var newDiv = document.createElement('div');
		newDiv.className = 'city';

		newDiv.innerHTML = 
		"<p class='place'>" + name + "</p>" + 
		"<p class='temp'> " + w.convertToCels(obj.main.temp) + "°" + "</p>" + 
		"<img src='http://openweathermap.org/img/w/" + obj.weather[0].icon + '.png' + "' alt='icon' class='icon_weather'>" + 
		"<p class='weather'> " + obj.weather[0].description + "</p>" + 
		"<img src='img/wind.png' alt='icon' class='icon wind'>" + 
		"<span class='wind'> " + obj.wind.speed + " m/s </span>" + 
		"<img src='img/humidity.png' alt='icon' class='icon humidity'>" + 
		"<span class='humid'> " + obj.main.humidity + '%' + "</span>";

		w.weatherInfoDiv.appendChild(newDiv);
	}


	w.convertToCels = function(temp) {
		var tempC = Math.round(temp - 273.15);
		return tempC;
	}

	w.constructUrl = function (lat, lon) {
		var url = weatherUrl + 'lat=' + lat + '&lon=' + lon + appid;
		return url; 
	}


	w.getLocalStorage = function() {
		var c = JSON.parse(localStorage.getItem('cities'));
		return c ? c : [];
	}
		
	w.setLocalStorage = function(data, googleData, cities, name) {
		if (data) {
			city.name = data.name; 
			city.coord.lat = data.coord.lat;
			city.coord.lon = data.coord.lon;
			cities.push(city);
			// console.log(JSON.stringify(cities));
			localStorage.setItem("cities", JSON.stringify(cities));

		} else if (googleData) {
			city.name = name; 
			city.coord.lat = googleData.results[0].geometry.location.lat;
			city.coord.lon = googleData.results[0].geometry.location.lng;
			// console.log('cities', cities);
			cities.push(city);
			localStorage.setItem("cities", JSON.stringify(cities));
		}
	}

	w.getWeatherFunc = function() {

	// in case localStorage is empty, we get weather for current user's location 
		if(!localStorage.cities) {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(location){

					var currentLocationWeather = null;
	
					var url = w.constructUrl(location.coords.latitude, location.coords.longitude);

					sendRequest(url, currentLocationWeather, function(data) {
						displayFunc(data, data.name);
						w.setLocalStorage(data, null, w.getLocalStorage());
					});
				});
			}
			else {
				alert('Browser could not find your current location');
		 	}
		}

	// in case there are items in localStorage, we get weather for each of them  
		else {
			var cities = w.getLocalStorage();
			// console.log(cities);
			var lat, lon, name;

			for (var i = 0; i < cities.length; i++) {

				(function(lat, lon, name){
					// console.log(c);
					name = cities[i].name;
					var newCityWeather = null;

					var newUrl = w.constructUrl(cities[i].coord.lat, cities[i].coord.lon);

					sendRequest(newUrl, newCityWeather, function(data){
						displayFunc(data, name);
					});
					 
				})(lat, lon, name);
			}
		}
	}

	w.addCityBtn.onclick = function() {

		var newCity = prompt('Please insert city, only Latin letters applicable', 'Kyiv');

		if (newCity && regE.test(newCity)) {
			var gUrl = googleUrl + newCity + googleKey;
			var newCityWeather = null;

			sendRequest(gUrl, newCityWeather, function(data) {

				var location = data.results[0].geometry.location;
				
				var newUrl = w.constructUrl(location.lat, location.lng);

				w.setLocalStorage(null, data, w.getLocalStorage(null, data), newCity);
				
				sendRequest(newUrl, data, function(data){
					displayFunc(data, newCity);
				});
			});
		}
	}

	w.rmCityBtn.onclick = function(city) {
		var cityToRemove = prompt('Which city do you want to remove?', 'Kyiv');

		if (cityToRemove) {
			var cities = w.getLocalStorage();
			// console.log(cities);

			for (var i = 0; i < cities.length; i++) {
				if (cities[i].name == cityToRemove) {

					cities.splice(i, 1);
					// console.log(cities);

					localStorage.setItem("cities", JSON.stringify(cities));

					w.weatherInfoDiv.innerHTML = '';
					w.getWeatherFunc();
				}
			}
		}
	}

	window.onload = w.getWeatherFunc;

}

