window.onload = getMyLocation();

function getMyLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(displayLocation, displayError);
  } else {
    alert("Oops, no geolocation support");
  }
}

// success handler
function displayLocation(position) {
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;

  var div = document.getElementById("location");
  div.innerHTML = "You are at Latitude: " + latitude + ", Longitude: " + longitude;
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
}
