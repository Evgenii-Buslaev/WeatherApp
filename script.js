// getting needed DOM-elements
let cityName = document.getElementById("city");
let locationBtn = document.getElementById("location-btn");
let timeString = document.getElementById('time')
let time = timeString.innerText.match(/\d+\:\d+/)[0]
console.log(time)

let date = new Date()
let hours = date.getHours()
let minutes = date.getMinutes()

time.innerText = `${hours}:${minutes}`


// object for current state
let city = {
  lat: null,
  lng: null,
  city_defined: false,
}

// function for getting user's location
function getLocation() {
  navigator.geolocation.getCurrentPosition(function (position) {
    city.lat = position.coords.latitude;
    city.lng = position.coords.longitude;
    
    let url =
      "https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address";
    let token = "7b0d07bc549fc06afcf392d74f2aa6beb81a784a";
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
    fetch(url, options)
      .then((response) => response.json())
      .then((result) => {
        cityName.innerText = result.suggestions[0].data.city_with_type.match(/(?<=\s)\p{Alpha}+/gu)
        city.city_defined = true
      })
      .catch((error) => {
        console.log("error", error)
        city.innerText = 'Москва'
        city.city_defined = true
      });
  });
}

// function for getting current weather
function getAPIData() {
  let check = setInterval(() => {
    if (city.city_defined === true) {
      
      let key = '6861653a70004c5f944134019221707'
      // getting current weather data
      fetch(`http://api.weatherapi.com/v1/current.json?key=${key}&q=${cityName.innerText}`)
        .then((response) => response.json())
        .then(result => console.log(result))
        .catch((err) => console.log('error', err))
      clearInterval(check)
      }
    }, 100)
}

let question = confirm('Определить Ваш город автоматически?')

if (question) {
  getLocation()
} else {
  cityName.innerText = 'Москва'
  city.city_defined = true
}

// events
window.addEventListener('load', getAPIData)


locationBtn.addEventListener("click", () => {
 city.city_defined = false
 getLocation()
 let check = setInterval(() => {
  if (city.city_defined === true) {
    getAPIData()
    clearInterval(check)
  }
 }, 100)
});

