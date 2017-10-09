var watchId = null;
var prevCoords = null;

var homeCoords = {
  latitude: 53.641901,
  longitude: 23.844813
};

var options = {enableHighAccuracy: true, timeout: 100, maximumAge: 0};

window.onload = getMyLocation;

function getMyLocation() {
  if (navigator.geolocation) {
    var watchButton = document.getElementById("watch");
    watchButton.onclick = watchLocation;
    var clearWatchButton = document.getElementById("clearWatch");
    clearWatchButton.onclick = clearWatch;
  } else {
    alert("Oops, no geolocation support");
  }
}

function watchLocation() {
  // argumets: success handler and error handler
  //watchId = navigator.geolocation.watchPosition(displayLocation, displayError,
  //  {timeout:5000});

    watchId = navigator.geolocation.watchPosition(displayLocation, displayError,
    options);
}

function clearWatch() {
  if (watchId) {

    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}

// success handler
function displayLocation(position) {
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;

  var div = document.getElementById("location");
  div.innerHTML = "You are at Latitude: " + latitude + ", Longitude: " + longitude;
  div.innerHTML += " (found in " + options.timeout + " milliseconds)";
  // если удалось определить локацию, сообщаем сколько времени это заняло
  div.innerHTML += " (with " + position.coords.accuracy + " meters accuracy)";

  var km = computeDistance(position.coords, homeCoords);
  var distance = document.getElementById("distance");
  distance.innerHTML = "You are " + km + " km from the house";

  // если функция showMap еще не вызывалась, следует вызвать ее;
  // в противном случае ее не нужно будет вызывать при каждом вызове displayLocation
  if (map == null) {
    showMap(position.coords);
    prevCoords = position.coords;
  } else {
    var meters = computeDistance(position.coords, prevCoords);
    if (meters > 20) {
        scrollMapToPosition(position.coords);
        prevCoords = null;
    }
  }
}

// error handler
// obj error contains error.code
function displayError(error) {
  var errorTypes = {
      0: "Unknown error",
      1: "Permissions denied by user",
      2: "Position is not available",
      3: "Request timed out"
  };

  //В случае с ошибками О и 2 иногда
  //в свойстве error.message присутствует дополнительная инфа
  //поэтому мы добавляем его в нашу строку error.Message.
  var errorMessage = errorTypes[error.code];
  if (error.code == 0 || error.code == 2) {
    errorMessage = errorMessage + " " + error.message;
  }

  var div = document.getElementById("location");
  div.innerHTML = errorMessage;

  // если не удалось определить местоположение, будем увеличивать
  // таймаут, также уведомление будет появляться о повторной попытке
  options.timeout +=100;
  navigator.geolocation.getCurrentPosition(
    displayLocation,
    displayError,
    options);
  div.innerHTML += "... checking again with timeout=" + options.timeout;
}

// вычисляет расстояние между двумя точками
function computeDistance(startCoords, destCoords) {
  var startLatRads = degreesToRadians(startCoords.latitude);
  var startLongRads = degreesToRadians(startCoords.longitude);
  var destLatRads = degreesToRadians(destCoords.latitude);
  var destLongRads = degreesToRadians(destCoords.longitude);

  var Radius = 6371; // радиус Земли
  var distance = Math.acos(Math.sin(startLatRads) * Math.sin(destLatRads) +
    Math.cos(startLatRads) * Math.cos(destLatRads) *
    Math.cos(startLongRads - destLongRads)) * Radius;

  // возвращает расстояние в километрах
  return distance;
}

function degreesToRadians(degrees) {
  var radians = (degrees * Math.PI)/180;
  return radians;
}

// google maps

var map;

// генерируем карту
function showMap(coords) {
  var googleLatAndLong = new google.maps.LatLng(coords.latitude,coords.longitude);

  var mapOptions = {
  zoom: 10,
  center: googleLatAndLong,
  mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var mapDiv = document.getElementById("map");
  map = new google.maps.Map(mapDiv, mapOptions);

  var title = "Your Location";
  var content = "You are here: " + coords.latitude + ", " + coords.longitude;
  addMarker(map, googleLatAndLong, title, content);
}

//add marker
function addMarker(map, latlong, title, content) {
  var markerOptions = {
    position: latlong,
    map: map,
    title: title,
    clickable: true
  };

  var marker = new google.maps.Marker(markerOptions);

  // Создадим информационное окно
  var infoWindowOptions = {
    content: content,
    position: latlong
  };

  var infoWindow = new google.maps.InfoWindow(infoWindowOptions);

  google.maps.event.addListener(marker, "click", function() {
    infoWindow.open(map);
  })
}

//
function scrollMapToPosition(coords) {
  var latitude = coords.latitude;
  var longitude = coords.longitude;
  var latlong = new google.maps.LatLng(latitude, longitude);

  // Метод painTo объекта map принимает объект LatLng и прокручивает карту
  // таким образом, чтобы текущее местоположение отображалось в ее центре
  map.panTo(latlong);
  addMarker(map, latlong, "Your new location", "You moved to: " +
    latitude + ", " + longitude);

}
