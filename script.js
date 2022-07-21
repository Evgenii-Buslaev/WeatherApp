// links
const locationUrl =
  "https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address";
const token = "7b0d07bc549fc06afcf392d74f2aa6beb81a784a";
const linkAPI = "https://api.weatherapi.com/v1/forecast.json";
const keyAPI = "6861653a70004c5f944134019221707";

// getting needed DOM-elements
let cityName = document.getElementById("city");
let locationBtn = document.getElementById("location-btn");
let timeString = document.getElementById("time");
let time = timeString.innerText.match(/\d+\:\d+/)[0];
let form = document.querySelector(".form");
let textInput = document.querySelector(".form-input");
let closePopup = document.getElementById("close");
let forecastBlock = document.getElementById("time-weather-prediction");
let scrollLeft = document.getElementById("scroll-left-btn");
let scrollRight = document.getElementById("scroll-right-btn");
let weatherData = document.querySelector(".weather-data");
let forecastBar = document.querySelector(".weather-forecast-bar");

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

    (async () => {
      // changing city name to current city (without a prefix)
      try {
        let promise = await fetch(locationUrl, options);
        let response = await promise.json();
        let result = await response;
        console.log(result);
        cityName.innerText =
          result.suggestions[0].data.city_with_type.match(
            /(?<=\s)\p{Alpha}+/gu
          );
        state.city_defined = true;
      } catch {
        console.log("error", error);
        cityName.innerText = "Москва";
        state.innerText = "Москва";
        state.city_defined = true;
      }
    })();
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
            forecast: {
              forecastday: {
                0: { hour },
              },
            },
            location: { name, localtime },
          } = result;

          console.log(result);

          store = {
            city: name,
            time: localtime,
            condition: { text, icon },
            temperature,
            feelsLike,
            isDay,
            wind,
            windDir,
            pressure,
            humidity,
            visability,
            forecast: hour,
          };
          city.data_recieved = true;
          renderProperties();
        })
        .catch((err) => {
          console.log("error", err);
          alert("Такой город не найден");
          cityName.innerHTML = "Москва";
          getAPIData();
        });
      clearInterval(check);
    }
  }, 100);
}

// function for displaying recieved data
function renderProperties() {
  let checkData = setInterval(() => {
    if (city.data_recieved === true) {
      // background
      if (store.isDay === 1) {
        document.querySelector("body").style.backgroundColor =
          "rgb(144, 206, 247)";
        document.querySelector("body").style.color = "black";
      } else {
        document.querySelector("body").style.backgroundColor =
          "rgb(17, 45, 63)";
        document.querySelector("body").style.color = "rgb(152, 165, 173)";
      }

      clearInterval(checkData);
      // render main weather container

      // time
      timeString.innerText = `Местное время: ${store.time.split(" ")[1]}`;

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
      document.getElementById(
        "wind"
      ).innerHTML = `<img src="Icons/marks/wind.png" alt="wind image" />
      ${(store.wind / 3.6).toFixed(2)} м/c, ${store.windDir}`;

      // humidity
      document.getElementById(
        "humidity"
      ).innerHTML = `<img src="Icons/marks/humidity.png" alt="humidity image" />
      ${store.humidity}%`;

      // pressure
      document.getElementById(
        "pressure"
      ).innerHTML = `<img src="Icons/marks/pressure.png" alt="pressure image" />
      ${parseInt(store.pressure * 0.750063755419211)} мм рт. ст.`;

      // condition
      document.getElementById(
        "state"
      ).innerHTML = `<img src=${store.condition.icon} alt='condition_day' />${store.condition.text}`;

      // custom images
      if (store.condition.text === "Солнечно") {
        document.getElementById(
          "state"
        ).innerHTML = `<img src="Icons/precipitation/sunny.png" alt='condition_day' />${store.condition.text}`;
        document.querySelector('body').style.backgroundImage = '' 
        document.querySelector('body').style.backgroundColor = 'rgba(112, 170, 209, 0.822)' 
      }
      if (store.condition.text.split(' ').indexOf('Облачно') >= 0 || store.condition.text.split(' ').indexOf('облачность')  >= 0) {
        document.getElementById(
          "state"
        ).innerHTML = `<img src="Icons/precipitation/cloudy.png" alt='condition_day' />${store.condition.text}`;
        document.querySelector('body').style.backgroundImage = '' 
        document.querySelector('body').style.backgroundColor = 'rgba(204, 209, 212, 0.822)'
      }
      if (store.condition.text === "Переменная облачность") {
        document.getElementById(
          "state"
        ).innerHTML = `<img src="Icons/precipitation/cloudy_with_sun.png" alt='condition_day' />${store.condition.text}`;
      }
      if (store.condition.text.split(' ').indexOf('дождь') >= 0 || store.condition.text.split(' ').indexOf('Дождь')  >= 0) {
        document.getElementById("state").innerHTML = "Дождь";
        document.getElementById(
          "state"
        ).innerHTML = `<img src="Icons/precipitation/rainy.png" alt='condition_day' />${store.condition.text}`;
        document.querySelector('body').style.backgroundImage = '' 
        document.querySelector('body').style.backgroundColor = 'rgba(115, 120, 122, 0.822)'
      }

      // render forecast
      forecastBlock.innerHTML = "";
      let firstElementIndex = +store.time.match(/\d+(?=\:)/) + 1;

      for (let i = firstElementIndex; i < 24; i++) {
        forecastBlock.innerHTML += `<div class="forecast-element" id=${i}>
                                        <div id="time">${i}:00</div>
                                        <div id=${i} >
                                        <img id='img' src=${store.forecast[i].condition.icon} alt='condition_day' />
                                        </div>
                                        <div id="time-temperature">+${store.forecast[i].temp_c}°</div>
                                    </div>`;
      }

      // forecast options

      forecastBar.addEventListener("click", (event) => {
        weatherData.style.opacity = 0;
        setTimeout(() => {
          if (
            event.target.getAttribute("id") === "time" ||
            event.target.getAttribute("id") === "time-temperature" ||
            event.target.getAttribute("id") === "img"
          ) {
            let element = event.target.parentNode;
            let elementNumber = element.getAttribute("id");

            // time
            timeString.innerText = `Прогноз на ${elementNumber}:00`;

            // temperature
            if (
              [...store.forecast[elementNumber].temp_c.toString()][0] !== "-"
            ) {
              document.getElementById(
                "temperature"
              ).innerText = `+${store.forecast[elementNumber].temp_c}°`;
              document.getElementById(
                "feels-like"
              ).innerText = `Ощущается как +${store.forecast[elementNumber].feelslike_c}°`;
            } else {
              document.getElementById(
                "temperature"
              ).innerText = `-${store.forecast[elementNumber].temp_c}°`;
              document.getElementById(
                "feels-like"
              ).innerText = `Ощущается как -${store.forecast[elementNumber].feelslike_c}°`;
            }

            // wind
            document.getElementById(
              "wind"
            ).innerHTML = `<img src="Icons/marks/wind.png" alt="wind image" />
          ${(store.forecast[elementNumber].wind_kph / 3.6).toFixed(2)} м/c, ${
              store.forecast[elementNumber].wind_dir
            }`;

            // humidity
            document.getElementById(
              "humidity"
            ).innerHTML = `<img src="Icons/marks/humidity.png" alt="humidity image" />
          ${store.forecast[elementNumber].humidity}%`;

            // pressure
            document.getElementById(
              "pressure"
            ).innerHTML = `<img src="Icons/marks/pressure.png" alt="pressure image" />
          ${parseInt(
            store.forecast[elementNumber].pressure_mb * 0.750063755419211
          )} мм рт. ст.`;
            // condition
            document.getElementById(
              "state"
            ).innerHTML = `<img src=${store.forecast[elementNumber].condition.icon} alt='condition_day' />${store.forecast[elementNumber].condition.text}`;
          }
        }, 500);
        setTimeout(() => {
          weatherData.style.opacity = 1;
        }, 1000);
      });
    }
  }, 100);
}

// loaded page
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

scrollRight.addEventListener("click", () => {
  forecastBlock.lastChild.scrollIntoView({ behavior: "smooth" });
});

scrollLeft.addEventListener("click", () => {
  forecastBlock.firstChild.scrollIntoView({ behavior: "smooth" });
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
  togglePopupClass();
};

form.addEventListener("submit", handleSubmit);
textInput.addEventListener("input", handleInput);
closePopup.addEventListener("click", () => {
  cityName.innerText = store.city;
  togglePopupClass();
});
