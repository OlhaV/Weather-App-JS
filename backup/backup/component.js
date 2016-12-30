function Component() {

	this.geolocationCheck = function(lat, lon, callbackFunc) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(location){
				lat = location.coords.latitude;
				lon = location.coords.longitude;
				callbackFunc();
				console.log(lat, lon);
				return lat, lon;
			});

		} else {
			alert('Could not find your current location');
		}


	
		
	}

}