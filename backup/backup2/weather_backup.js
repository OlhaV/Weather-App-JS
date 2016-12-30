function Weather () {
	var w = this;

	var weatherUrl = 'http://api.openweathermap.org/data/2.5/weather?'; 
	var appid = '&appid=c0a7816b2acba9dbfb70977a1e537369';
	var googleUrl =  'https://maps.googleapis.com/maps/api/geocode/json?address=';
	var googleKey = '&key=AIzaSyBHBjF5lDpw2tSXVJ6A1ra-RKT90ek5bvQ';

	w.place = document.getElementById('place');
	w.description = document.getElementById('description');
	w.temp = document.getElementById('temp');
	w.humidity = document.getElementById('humidity');
	w.getWeather = document.getElementById('getWeather');
	w.addCityBtn = document.getElementById('addCity');
	w.rmCityBtn = document.getElementById('rmCity');
	w.icon = document.getElementById('icon');
	w.wind = document.getElementById('wind');
	w.lat = null;
	w.lon = null;
	w.cityArray = [];
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

			w.icon.src = 'http://openweathermap.org/img/w/' + obj.weather[0].icon + '.png';
			w.place.innerHTML = 'Place: ' +  obj.name;
			w.description.innerHTML = "Weather: " + obj.weather[0].description;
			w.temp.innerHTML = "Temperature: " + w.convertToCels(obj.main.temp) + "°C";
			w.humidity.innerHTML = "Humidity: " + obj.main.humidity + '%';
			w.wind.innerHTML = 'Wind: ' + obj.wind.speed + ' meter/sec';
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

				var url = weatherUrl + 'lat=' + w.lat + '&lon=' + w.lon + appid;

				sendRequest(url, w.weather, displayFunc);
			});
		} else {
			alert('Browser could not find your current location');
		}
	}

	function displayNewCity (obj) {
		var newDiv = document.createElement('div');
		newDiv.innerHTML = 
		"<p> Place: " + obj.name + "</p>" + 
		"<p> Weather: " + obj.weather[0].description + "</p>" + 
		"<p> Temperature: " + w.convertToCels(obj.main.temp) + "°C" + "</p>" + 
		"<p> Wind: " + obj.wind.speed + " meter/sec </p>" + 
		"<p> Humidity: " + obj.main.humidity + '%' + "</p>" + 
		"<img src='" + 'http://openweathermap.org/img/w/' + obj.weather[0].icon + '.png' + "' alt='icon'>"; 

		document.getElementsByClassName('weatherInfo')[0].insertBefore(newDiv, w.place);
	} 

	w.addCityBtn.onclick = function() {

		var newCity = prompt('Please insert city', 'Kiev');
		var gUrl = googleUrl + newCity + googleKey;
		var newCityWeather = null;

		sendRequest(gUrl, newCityWeather, function(data){
			console.log(data);
			var location = data.results[0].geometry.location;
			var newUrl = weatherUrl + 'lat=' + location.lat + '&lon=' + location.lng + appid;
			sendRequest(newUrl, data, displayNewCity);
		});

		w.cityArray.push(newCity);
		localStorage.setItem('cities', w.cityArray);
		console.log(localStorage);
	}

	// w.rmCityBtn.onclick = function(city) {
	// 	w.cityArray.remove(city);
	// }

	window.onload = w.getWeatherFunc;

	setInterval(function() {
		w.getWeatherFunc();
	}, 900000);

}

