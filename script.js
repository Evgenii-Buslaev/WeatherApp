let city = document.getElementById("city");
let locationBtn = document.getElementById("location-btn");

let lat;
let lng;

locationBtn.addEventListener("click", () => {
  // getting coords of user
  navigator.geolocation.getCurrentPosition(function (position) {
    lat = position.coords.latitude;
    lng = position.coords.longitude;
    console.log(lat);
    console.log(lng);
    // defining city with coords
    let url =
      "https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address";
    let token = "7b0d07bc549fc06afcf392d74f2aa6beb81a784a";
    let query = { lat: lat, lon: lng };

    let options = {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Token " + token,
      },
      body: JSON.stringify(query),
    };

    fetch(url, options)
      .then((response) => response.json())
      .then(
        (result) => (city.innerText = result.suggestions[0].data.city_with_type)
      )
      .catch((error) => console.log("error", error));
  });
});
