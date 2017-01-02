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

	w.checkLocalStorage = function() {
		var c = localStorage.getItem('cities');
		c = c ? [JSON.parse(c)] : [];
		return c;
	}
		
	w.setLocalStorage = function(data, googleData, cities) {
		if (data) {
			city.name = data.name; 
			city.coord.lat = data.coord.lat;
			city.coord.lon = data.coord.lon;
			cities.push(JSON.stringify(city));
			console.log(city);
			localStorage.setItem("cities", cities);

		} else if (googleData) {
			//city.name = data.name; 
			city.coord.lat = googleData.results[0].geometry.location.lat;
			city.coord.lon = googleData.results[0].geometry.location.lng;
			console.log(city);
			cities.push(JSON.stringify(city));
			localStorage.setItem("cities", cities);
		}
	}

	w.getWeatherFunc = function() {

	// in case localStorage is empty, we get weather for current user's location 
		if(!localStorage.cities) {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(location){
					w.lat = location.coords.latitude;
					w.lon = location.coords.longitude;
					var currentLocationWeather = null;

					var url = weatherUrl + 'lat=' + w.lat + '&lon=' + w.lon + appid;
					sendRequest(url, currentLocationWeather, function(data) {
						displayFunc(data, data.name);
						w.setLocalStorage(data, null, w.checkLocalStorage());
					});
				});
			}
			else {
				alert('Browser could not find your current location');
		 	}
		}

	// in case there are items in localStorage, we get weather for each of them  
		else {
			var cities = w.checkLocalStorage();
			var lat, lon;

			for (var i = 0; i < cities.length; i++) {

				(function(lat, lon){
					lat = cities[i].coord.lat;
					lon = cities[i].coord.lon;

					var newUrl = weatherUrl + 'lat=' + lat + '&lon=' + lon + appid;
					var newCityWeather = null;

					sendRequest(newUrl, newCityWeather, function(data){
						displayFunc(data, data.name);
					});
					 
					// name = cities[i].name;
					// var gUrl = googleUrl + name + googleKey;
					// var newCityWeather = null;

					// sendRequest(gUrl, newCityWeather, function(data){

					// 	w.setLocalStorage(null, data, w.checkLocalStorage());

					// 	var newUrl = weatherUrl + 'lat=' + location.lat + '&lon=' + location.lng + appid;

					// });
				})(lat, lon);
			}
		}
	}

	w.addCityBtn.onclick = function() {	

		var newCity = prompt('Please insert city, only Latin letters applicable', 'Kyiv');

		if (newCity && regE.test(newCity)) {
			var gUrl = googleUrl + newCity + googleKey;
			var newCityWeather = null;

			sendRequest(gUrl, newCityWeather, function(data) {			
				
				// var c = localStorage.getItem('cities');
				// c = c ? JSON.parse(c) : {};
				// c.push(data.name);
				// localStorage.setItem("cities", JSON.stringify(c));

				var location = data.results[0].geometry.location;
				var newUrl = weatherUrl + 'lat=' + location.lat + '&lon=' + location.lng + appid;
				w.setLocalStorage(null, data, w.checkLocalStorage(null, data));
				
				sendRequest(newUrl, data, function(data){
					displayFunc(data, newCity);
				});
			});
		}
	}

	w.rmCityBtn.onclick = function(city) {
		var cityToRemove = prompt('Which city do you want to remove?');

		if (cityToRemove) {
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
	}

	window.onload = w.getWeatherFunc;

}

