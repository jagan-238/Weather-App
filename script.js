/* script.js - index page logic */

/* ========== CONFIG (your keys) ========== */
const OPENWEATHER_KEY = "fecc89cb6ae3a321117cf046a21aabea"; // provided
// Google Maps key is included directly in index.html script tag (callback initMap)

let map, marker;
let currentCoords = null;
let currentCity = "";
let units = "metric"; // 'metric' or 'imperial'

/* ========== DOM refs ========== */
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const locBtn = document.getElementById("locBtn");
const forecastBtn = document.getElementById("forecastBtn");
const cBtn = document.getElementById("cBtn");
const fBtn = document.getElementById("fBtn");

const locationName = document.getElementById("locationName");
const updatedAt = document.getElementById("updatedAt");
const tempEl = document.getElementById("temp");
const descEl = document.getElementById("desc");
const iconEl = document.getElementById("icon");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");

/* ========== MAP ========== */
// Called by Google Maps script on load
function initMap(lat = 20.5937, lon = 78.9629) {
  const center = { lat: lat || 20.5937, lng: lon || 78.9629 };
  map = new google.maps.Map(document.getElementById("map"), {
    center,
    zoom: lat ? 10 : 4,
    disableDefaultUI: false,
  });
}
window.initMap = initMap;

function placeMarker(lat, lon, title = "") {
  if (!map) {
    // map not loaded yet; wait shortly and retry
    setTimeout(() => placeMarker(lat, lon, title), 350);
    return;
  }
  const pos = { lat: Number(lat), lng: Number(lon) };
  map.setCenter(pos);
  map.setZoom(9);
  if (marker) marker.setMap(null);
  marker = new google.maps.Marker({ position: pos, map, title });
}

/* ========== UTIL ========== */
function formatTimeFromUnix(unixSec, tzOffsetSeconds) {
  // Convert to local time of target city using offset returned by OWM (seconds)
  const dt = new Date((unixSec + tzOffsetSeconds) * 1000);
  const hh = String(dt.getUTCHours()).padStart(2, "0");
  const mm = String(dt.getUTCMinutes()).padStart(2, "0");
  const ss = String(dt.getUTCSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function applyBackgroundByCondition(main) {
  document.body.classList.remove("sunny", "cloudy", "rainy", "snow");
  if (!main) return;
  const key = main.toLowerCase();
  if (key.includes("cloud")) document.body.classList.add("cloudy");
  else if (key.includes("rain") || key.includes("drizzle") || key.includes("thunder")) document.body.classList.add("rainy");
  else if (key.includes("snow")) document.body.classList.add("snow");
  else document.body.classList.add("sunny");
}

/* ========== FETCH WEATHER ========== */
async function fetchWeatherByCoords(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${OPENWEATHER_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.cod && data.cod !== 200) throw new Error(data.message || "Weather fetch error");
    currentCoords = { lat: data.coord.lat, lon: data.coord.lon };
    currentCity = data.name;
    renderCurrentWeather(data);
    placeMarker(data.coord.lat, data.coord.lon, data.name);
  } catch (err) {
    alert("Could not fetch weather: " + err.message);
    console.error(err);
  }
}

async function fetchWeatherByCity(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${units}&appid=${OPENWEATHER_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.cod && data.cod !== 200) throw new Error(data.message || "City not found");
    currentCoords = { lat: data.coord.lat, lon: data.coord.lon };
    currentCity = data.name;
    renderCurrentWeather(data);
    placeMarker(data.coord.lat, data.coord.lon, data.name);
  } catch (err) {
    alert("City not found. Try another name.");
    console.error(err);
  }
}

/* ========== RENDER ========== */
function renderCurrentWeather(data) {
  const unitSym = units === "metric" ? "°C" : "°F";
  const now = new Date();
  locationName.textContent = `${data.name}, ${data.sys.country}`;
  updatedAt.textContent = `updated ${now.toLocaleTimeString()}`;

  tempEl.textContent = `${Math.round(data.main.temp)}${unitSym}`;
  descEl.textContent = data.weather[0].description;
  iconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  iconEl.alt = data.weather[0].description;
  iconEl.style.display = "inline-block";

  humidityEl.textContent = `${data.main.humidity}%`;
  windEl.textContent = units === "metric" ? `${data.wind.speed} m/s` : `${data.wind.speed} mph`;

  // sunrise/sunset in city's local timezone using timezone offset
  const tzOffset = data.timezone || 0; // seconds
  sunriseEl.textContent = formatTimeFromUnix(data.sys.sunrise, tzOffset);
  sunsetEl.textContent = formatTimeFromUnix(data.sys.sunset, tzOffset);

  applyBackgroundByCondition(data.weather[0].main);
}

/* ========== EVENTS ========== */
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const q = searchInput.value.trim();
    if (q) fetchWeatherByCity(q);
  }
});
searchBtn.addEventListener("click", () => {
  const q = searchInput.value.trim();
  if (q) fetchWeatherByCity(q);
});

locBtn.addEventListener("click", () => {
  if (!("geolocation" in navigator)) return alert("Geolocation not supported");
  navigator.geolocation.getCurrentPosition(
    pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
    err => alert("Could not get location: " + err.message)
  );
});

forecastBtn.addEventListener("click", () => {
  if (!currentCoords) return alert("Please search or allow location first.");
  // Pass lat, lon, city and units as query params (forecast page will read)
  const q = `lat=${encodeURIComponent(currentCoords.lat)}&lon=${encodeURIComponent(currentCoords.lon)}&city=${encodeURIComponent(currentCity)}&units=${encodeURIComponent(units)}`;
  window.location.href = `forecast.html?${q}`;
});

/* Units toggle */
cBtn.addEventListener("click", () => {
  if (units === "metric") return;
  units = "metric";
  cBtn.classList.add("active");
  fBtn.classList.remove("active");
  // re-fetch to update units
  if (currentCoords) fetchWeatherByCoords(currentCoords.lat, currentCoords.lon);
});
fBtn.addEventListener("click", () => {
  if (units === "imperial") return;
  units = "imperial";
  fBtn.classList.add("active");
  cBtn.classList.remove("active");
  if (currentCoords) fetchWeatherByCoords(currentCoords.lat, currentCoords.lon);
});

/* ========== INITIAL GEO on load ========== */
window.addEventListener("load", () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => {
        // user denied or failed: nothing: user can search manually
        console.log("Geolocation denied or not available.");
      },
      { maximumAge: 5 * 60 * 1000 }
    );
  } else {
    console.log("Geolocation not supported.");
  }
});
