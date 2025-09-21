
const OPENWEATHER_KEY = "fecc89cb6ae3a321117cf046a21aabea";

function getQueryParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    lat: p.get("lat"),
    lon: p.get("lon"),
    city: p.get("city") || "",
    units: p.get("units") || "metric"
  };
}

function formatLocalDate(unixSec, tzOffsetSeconds) {
  const dt = new Date((unixSec + tzOffsetSeconds) * 1000);
  
  return dt.toUTCString().slice(0, 16);
}

async function fetchForecastByCoords(lat, lon, units) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${OPENWEATHER_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.cod && data.cod !== "200") throw new Error(data.message || "Forecast fetch failed");
  return data;
}

async function fetchForecastByCity(city, units) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=${units}&appid=${OPENWEATHER_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.cod && data.cod !== "200") throw new Error(data.message || "Forecast fetch failed");
  return data;
}

function chooseIconForDay(items) {

  const freq = {};
  items.forEach(i => {
    const ico = i.weather[0].icon;
    freq[ico] = (freq[ico] || 0) + 1;
  });
  const best = Object.keys(freq).sort((a,b)=> freq[a]-freq[b]).pop();
  return best;
}

function renderForecastCards(dayEntries, cityName, unitsSymbol) {
  const container = document.getElementById("forecastContainer");
  const header = document.getElementById("cityHeader");
  header.textContent = `Forecast for ${cityName} (${unitsSymbol})`;
  container.innerHTML = "";

  dayEntries.forEach(d => {
    const dateLabel = new Date(d.dateStr).toDateString();
    const icon = chooseIconForDay(d.items);
    const min = Math.round(d.min);
    const max = Math.round(d.max);
    const desc = d.items[0].weather[0].description;

    const card = document.createElement("div");
    card.className = "fc-card";
    card.innerHTML = `
      <div class="fc-date">${dateLabel}</div>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" />
      <div class="fc-temp">Min ${min} / Max ${max}</div>
      <div class="fc-desc" style="color: #556073; text-transform:capitalize">${desc}</div>
    `;
    container.appendChild(card);
  });
}

function aggregateListByLocalDay(list, tzOffset) {
  
  const map = {};
  list.forEach(item => {

    const local = new Date((item.dt + tzOffset) * 1000);
    const dateStr = local.toISOString().slice(0,10);
    if (!map[dateStr]) map[dateStr] = { min: item.main.temp, max: item.main.temp, items: [item], dateStr };
    else {
      map[dateStr].min = Math.min(map[dateStr].min, item.main.temp);
      map[dateStr].max = Math.max(map[dateStr].max, item.main.temp);
      map[dateStr].items.push(item);
    }
  });
  return Object.values(map).slice(0,5); // first 5 days
}

(async function loadForecast(){
  try {
    const params = getQueryParams();
    let data;
    if (params.lat && params.lon) data = await fetchForecastByCoords(params.lat, params.lon, params.units);
    else if (params.city) data = await fetchForecastByCity(params.city, params.units);
    else throw new Error("No location provided");

    const tz = data.city.timezone || 0;
    const days = aggregateListByLocalDay(data.list, tz);
    const unitSym = params.units === "metric" ? "°C" : "°F";
    renderForecastCards(days, data.city.name || params.city, unitSym);
  } catch (err) {
    const container = document.getElementById("forecastContainer");
    container.innerHTML = `<div style="color:#cc0000">Could not load forecast: ${err.message}</div>`;
    console.error(err);
  }
})();
