// links
let locationUrl =
  "https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address";
let token = "7b0d07bc549fc06afcf392d74f2aa6beb81a784a";
const linkAPI = "http://api.weatherapi.com/v1/current.json";
let keyAPI = "6861653a70004c5f944134019221707";

// getting needed DOM-elements
let cityName = document.getElementById("city");
let locationBtn = document.getElementById("location-btn");
let timeString = document.getElementById("time");
let time = timeString.innerText.match(/\d+\:\d+/)[0];

// working with time
let date = new Date();
let hours = date.getHours();
let minutes = date.getMinutes();

if (hours.toString().length < 2) {
  hours = "0" + hours;
}
if (minutes.toString().length < 2) {
  minutes = "0" + minutes;
}

timeString.innerText = `Сейчас ${hours}:${minutes}.`;

// object for current state
let city = {
  lat: null,
  lng: null,
  city_defined: false,
  data_recieved: false,
};

// object for weather
let store = {
  city: "Москва",
  condition: "Ясно",
  temperature: 0,
  feelsLike: 0,
  isDay: 0,
  wind: 0,
  windDir: 0,
  pressure: 0,
  humidity: 0,
  visability: 0,
};

// function for getting user's location
function getLocation() {
  navigator.geolocation.getCurrentPosition(function (position) {
    city.lat = position.coords.latitude;
    city.lng = position.coords.longitude;
    let query = { lat: city.lat, lon: city.lng };

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

    // changing city name to current city (without a prefix)
    fetch(locationUrl, options)
      .then((response) => response.json())
      .then((result) => {
        cityName.innerText =
          result.suggestions[0].data.city_with_type.match(
            /(?<=\s)\p{Alpha}+/gu
          );
        city.city_defined = true;
      })
      .catch((error) => {
        console.log("error", error);
        city.innerText = "Москва";
        city.city_defined = true;
      });
  });
}

// function for getting current weather
function getAPIData() {
  let check = setInterval(() => {
    if (city.city_defined === true) {
      // getting current weather data
      fetch(`${linkAPI}?key=${keyAPI}&q=${cityName.innerText}`)
        .then((response) => response.json())
        .then((result) => {
          const {
            current: {
              condition: { text },
              temp_c: temperature,
              feelslike_c: feelsLike,
              humidity,
              is_day: isDay,
              wind_kph: wind,
              wind_dir: windDir,
              pressure_mb: pressure,
              vis_km: visability,
            },
            location: { name },
          } = result;

          store = {
            city: name,
            condition: text,
            temperature,
            feelsLike,
            isDay,
            wind,
            windDir,
            pressure,
            humidity,
            visability,
          };
          city.data_recieved = true;
        })
        .catch((err) => console.log("error", err));
      clearInterval(check);
    }
  }, 100);
}

let question = confirm("Определить Ваш город автоматически?");

if (question) {
  getLocation();
} else {
  cityName.innerText = "Москва";
  city.city_defined = true;
}

function renderProperties() {
  let checkData = setInterval(() => {
    if (city.data_recieved === true) {
      console.log(store);
      clearInterval(checkData);
    }
  }, 100);
}

renderProperties();

// events
window.addEventListener("load", getAPIData);

locationBtn.addEventListener("click", () => {
  city.city_defined = false;
  getLocation();
  let check = setInterval(() => {
    if (city.city_defined === true) {
      getAPIData();
      clearInterval(check);
    }
  }, 100);
});
