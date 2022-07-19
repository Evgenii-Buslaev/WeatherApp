// links
const locationUrl =
  "https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address";
const token = "7b0d07bc549fc06afcf392d74f2aa6beb81a784a";
const linkAPI = "http://api.weatherapi.com/v1/current.json";
const keyAPI = "6861653a70004c5f944134019221707";

// getting needed DOM-elements
let cityName = document.getElementById("city");
let locationBtn = document.getElementById("location-btn");
let timeString = document.getElementById("time");
let time = timeString.innerText.match(/\d+\:\d+/)[0];
let form = document.querySelector(".form");
let textInput = document.querySelector(".form-input");

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
let state = {
  lat: null,
  lng: null,
  city_defined: false,
  data_recieved: false,
};

// object for weather
let store = {
  city: null,
  condition: null,
  temperature: 0,
  feelsLike: 0,
  isDay: 0,
  wind: 0,
  windDir: 0,
  pressure: 0,
  humidity: 0,
  visability: 0,
};

// function for displaying recieved data
function renderProperties() {
  let checkData = setInterval(() => {
    if (city.data_recieved === true) {
      console.log(store);
      clearInterval(checkData);

      // temperature
      if ([...store.temperature.toString()][0] !== "-") {
        document.getElementById(
          "temperature"
        ).innerText = `+${store.temperature}°`;
        document.getElementById(
          "feels-like"
        ).innerText = `Ощущается как +${store.feelsLike}°`;
      } else {
        document.getElementById(
          "temperature"
        ).innerText = `-${store.temperature}°`;
        document.getElementById(
          "feels-like"
        ).innerText = `Ощущается как -${store.feelsLike}°`;
      }

      // wind
      document.getElementById("wind").innerHTML += `
      ${(store.wind / 3.6).toFixed(2)} м/c, ${store.windDir}`;

      // humidity
      document.getElementById("humidity").innerHTML += `${store.humidity}%`;

      // pressure
      document.getElementById("pressure").innerHTML += `${parseInt(
        store.pressure * 0.750063755419211
      )} мм рт. ст.`;

      // condition

      document.getElementById("state").innerHTML += `${store.condition.text}`;
      document
        .getElementById("weather-img")
        .setAttribute("src", store.condition.icon);

      // custom images
      if (store.condition.text === "Солнечно") {
        document
          .getElementById("weather-img")
          .setAttribute("src", "Icons/precipitation/sunny.png");
      }
      if (store.condition.text === "Облачно") {
        document
          .getElementById("weather-img")
          .setAttribute("src", "Icons/precipitation/cloudy.png");
      }
      if (store.condition.text === "Переменная облачность") {
        document
          .getElementById("weather-img")
          .setAttribute("src", "Icons/precipitation/cloudy_with_sun.png");
      }
      if (store.condition.text === "Дождь") {
        document.getElementById("state").innerHTML = "Дождь";
        document
          .getElementById("weather-img")
          .setAttribute("src", "Icons/precipitation/rainy.png");
      }
    }
  }, 100);
}

// function for getting user's location
function getLocation() {
  navigator.geolocation.getCurrentPosition(function (position) {
    state.lat = position.coords.latitude;
    state.lng = position.coords.longitude;
    let query = { lat: state.lat, lon: state.lng };

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
        state.city_defined = true;
      })
      .catch((error) => {
        console.log("error", error);
        state.innerText = "Москва";
        state.city_defined = true;
      });
  });
}

// function for getting current weather
function getAPIData() {
  let check = setInterval(() => {
    if (state.city_defined === true) {
      // getting current weather data
      fetch(`${linkAPI}?key=${keyAPI}&q=${cityName.innerText}&lang=ru`)
        .then((response) => response.json())
        .then((result) => {
          const {
            current: {
              condition: { text, icon },
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
            condition: { text, icon },
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
          renderProperties();
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
  state.city_defined = true;
}

// events
window.addEventListener("load", getAPIData);

locationBtn.addEventListener("click", () => {
  state.city_defined = false;
  getLocation();
  let check = setInterval(() => {
    if (state.city_defined === true) {
      getAPIData();
      clearInterval(check);
    }
  }, 100);
});

// function and events for popup
const togglePopupClass = () => {
  popup.classList.toggle("active");
};

cityName.addEventListener("click", togglePopupClass);

const handleInput = (e) => {
  cityName.innerText = e.target.value;
};

const handleSubmit = (e) => {
  e.preventDefault();
  const value = cityName;

  if (!value) return null;
  getAPIData();
  renderProperties();
  togglePopupClass();
};

form.addEventListener("submit", handleSubmit);
textInput.addEventListener("input", handleInput);
