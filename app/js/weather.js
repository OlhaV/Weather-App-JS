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
						displayFunc(data, data.name);
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
			var name = null; 

			for (var i = 0; i < cities.length; i++) {

				(function(name){

					var gUrl = googleUrl + cities[i] + googleKey;
					var newCityWeather = null;
					name = cities[i];

					sendRequest(gUrl, newCityWeather, function(data){
						var location = data.results[0].geometry.location;
						var newUrl = weatherUrl + 'lat=' + location.lat + '&lon=' + location.lng + appid;
						sendRequest(newUrl, data, function(data){
							displayFunc(data, name);
						});
					});


				})(name);

				
			}
		}
	}

	w.addCityBtn.onclick = function() {

		var newCity = prompt('Please insert city, only Latin letters applicable', 'Kiev');
		var regE = /[A-Za-z]/;

		console.log(regE.test(newCity))

		if (newCity && regE.test(newCity)) {
			var gUrl = googleUrl + newCity + googleKey;
			var newCityWeather = null;

			sendRequest(gUrl, newCityWeather, function(data){
				var location = data.results[0].geometry.location;
				var newUrl = weatherUrl + 'lat=' + location.lat + '&lon=' + location.lng + appid;
				sendRequest(newUrl, data, function(data){
					displayFunc(data, newCity);
				});
			});

			if (!localStorage.getItem('cities')) {
				localStorage.setItem('cities', newCity);
			} 
			else {
				var cities = localStorage.getItem('cities').split(',');
				cities.push(newCity);
				localStorage.setItem('cities', cities.join());
			}
		} else {
			alert('Please insert the correct value');
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
				// else {
				// 	alert('No such city');
				// }
			}
		}
	}

	window.onload = w.getWeatherFunc;

}

