// Smart Weather & Travel Dashboard - Open-Meteo (free, no API key)
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WX_URL = "https://api.open-meteo.com/v1/forecast";
const $ = (id) => document.getElementById(id);

const state = { unit: "C", place: null, data: null };

// ---------- helpers ----------
const fmtTemp = (c) => (state.unit === "C" ? `${Math.round(c)}°` : `${Math.round((c * 9) / 5 + 32)}°`);
const dayName = (iso, i) => (i === 0 ? "Today" : new Date(`${iso}T00:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric" }));

function showMessage(text, type = "error") {
  const m = $("message");
  m.textContent = text;
  m.className = type;
  m.hidden = false;
}

function validateCity(raw) {
  const city = raw.trim();
  if (!city) throw new Error("Enter a city name to search.");
  if (city.length < 2 || city.length > 60) throw new Error("City names must be 2 to 60 characters long.");
  if (!/^[\p{L}\s.'-]+$/u.test(city)) throw new Error("Use letters only. Numbers and symbols aren't valid in city names.");
  return city;
}

async function fetchJSON(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`The weather service returned an error (${res.status}). Try again shortly.`);
    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") throw new Error("The request timed out. Check your connection and try again.");
    if (err instanceof TypeError) throw new Error("Couldn't reach the weather service. Check your internet connection.");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function geocode(city) {
  const data = await fetchJSON(`${GEO_URL}?name=${encodeURIComponent(city)}&count=1&language=en`);
  if (!data.results?.length) throw new Error(`No city found for "${city}". Check the spelling and try again.`);
  return data.results[0];
}

async function getForecast({ latitude, longitude }) {
  const params = new URLSearchParams({
    latitude, longitude, timezone: "auto", forecast_days: 7,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,uv_index",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max",
  });
  const data = await fetchJSON(`${WX_URL}?${params}`);
  if (!data.current || !data.daily) throw new Error("Weather data wasn't available for this location.");
  return data;
}

// ---------- recent searches ----------
function loadRecent() {
  try { return JSON.parse(localStorage.getItem("recentCities") ?? "[]"); } catch { return []; }
}
function saveRecent(name) {
  try {
    const list = [name, ...loadRecent().filter((c) => c.toLowerCase() !== name.toLowerCase())].slice(0, 5);
    localStorage.setItem("recentCities", JSON.stringify(list));
  } catch { /* storage unavailable: ignore */ }
  renderRecent();
}
function renderRecent() {
  $("recent").replaceChildren(...loadRecent().map((c) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.textContent = c;
    b.addEventListener("click", () => { $("city").value = c; search(c); });
    return b;
  }));
}

// ---------- rendering ----------
function render() {
  const { place, data } = state;
  const c = data.current, d = data.daily;
  const info = describeCode(c.weather_code);
  const isDay = c.is_day === 1;

  document.body.dataset.sky = info.kind === "clear" || info.kind === "partly" ? (isDay ? "clear-day" : "clear-night") : info.kind;
  $("place").textContent = [place.name, place.admin1, place.country].filter(Boolean).join(", ");
  $("condition").textContent = info.label;
  $("temp").textContent = fmtTemp(c.temperature_2m);
  $("now-icon").innerHTML = weatherIcon(info.kind, isDay);
  $("stats").innerHTML = [
    ["Feels like", fmtTemp(c.apparent_temperature)], ["Humidity", `${c.relative_humidity_2m}%`],
    ["Wind", `${Math.round(c.wind_speed_10m)} km/h`], ["UV index", Math.round(c.uv_index)],
  ].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");

  // 7-day cards + scores
  const days = d.time.map((date, i) => {
    const day = {
      code: d.weather_code[i], tmax: d.temperature_2m_max[i], tmin: d.temperature_2m_min[i],
      precip: d.precipitation_probability_max[i] ?? 0, wind: d.wind_speed_10m_max[i], uv: d.uv_index_max[i] ?? 0,
    };
    return { ...day, date, score: scoreDay(day), info: describeCode(day.code) };
  });
  $("forecast").innerHTML = days.map((x, i) => {
    const v = verdictFor(x.score);
    return `<li class="day ${i === 0 ? "today" : ""}">
      <b>${dayName(x.date, i)}</b>
      <div class="icon">${weatherIcon(x.info.kind, true)}</div>
      <span class="hl">${fmtTemp(x.tmax)} <small>${fmtTemp(x.tmin)}</small></span>
      <span class="rain">Rain ${x.precip}%</span>
      <span class="badge ${v.level}" title="Travel score ${x.score}/100">${v.level === "great" ? "Great" : v.level === "ok" ? "Okay" : "Poor"}</span>
    </li>`;
  }).join("");

  // Travel suggestions (based on today)
  const today = days[0];
  const s = suggestionsFor({ kind: info.kind, temp: c.temperature_2m, wind: c.wind_speed_10m, uv: c.uv_index, precip: today.precip });
  const v = verdictFor(today.score);
  $("verdict").className = `verdict ${v.level}`;
  $("verdict").textContent = `Today: ${v.text}`;
  const best = days.reduce((a, b) => (b.score > a.score ? b : a));
  const bestIdx = days.indexOf(best);
  $("best-day").textContent = bestIdx === 0
    ? "Today is the best day this week for travel."
    : `Best day this week: ${dayName(best.date, bestIdx)} (${best.info.label}, ${fmtTemp(best.tmax)}).`;
  $("todo").innerHTML = s.todo.map((t) => `<li>${t}</li>`).join("");
  $("pack").innerHTML = s.pack.map((t) => `<li>${t}</li>`).join("");
  $("tip").textContent = s.tip;

  $("dash").hidden = false;
}

// ---------- main flow ----------
async function search(raw) {
  $("message").hidden = true;
  const btn = $("go");
  try {
    const city = validateCity(raw);
    btn.disabled = true;
    showMessage("Loading weather…", "info");
    const place = await geocode(city);
    const data = await getForecast(place);
    state.place = place; state.data = data;
    $("message").hidden = true;
    render();
    saveRecent(place.name);
  } catch (err) {
    $("dash").hidden = true;
    showMessage(err.message);
    console.error(err);
  } finally {
    btn.disabled = false;
  }
}

$("search-form").addEventListener("submit", (e) => { e.preventDefault(); search($("city").value); });
$("unit").addEventListener("click", () => {
  state.unit = state.unit === "C" ? "F" : "C";
  $("unit").innerHTML = `&deg;${state.unit}`;
  if (state.data) render();
});
renderRecent();
