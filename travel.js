// Rule-based travel recommendations from weather data.

// Score a day 0-100 (higher = better for travelling)
function scoreDay({ code, precip, tmax, tmin, wind, uv }) {
  let s = 100;
  s -= Math.round((precip ?? 0) * 0.45);
  if ([95, 96, 99].includes(code)) s -= 40;
  else if ([65, 67, 82].includes(code)) s -= 25;
  else if ([71, 73, 75, 77, 85, 86].includes(code)) s -= 20;
  else if (code === 45 || code === 48) s -= 10;
  if (tmax > 38) s -= 30; else if (tmax > 34) s -= 15;
  if (tmin < 0) s -= 25; else if (tmin < 5) s -= 12;
  if (wind > 40) s -= 25; else if (wind > 25) s -= 10;
  if (uv >= 8) s -= 5;
  return Math.max(0, Math.min(100, s));
}

function verdictFor(score) {
  if (score >= 75) return { level: "great", text: "Great day to travel" };
  if (score >= 50) return { level: "ok", text: "Okay, with some planning" };
  return { level: "poor", text: "Not ideal, consider rescheduling" };
}

// Suggestions for today's conditions
function suggestionsFor({ kind, temp, wind, uv, precip }) {
  const band = temp >= 32 ? "hot" : temp >= 22 ? "warm" : temp >= 10 ? "cool" : "cold";
  let todo, tip;
  if (kind === "storm") {
    todo = ["Museums and indoor attractions", "Cafes and food halls", "Spa or wellness session", "Plan a movie or games day"];
    tip = "Thunderstorms: avoid open areas, hilltops and water activities, and check transport delays.";
  } else if (kind === "rain") {
    todo = ["Museums and galleries", "Local cafes and street-food halls", "Shopping malls and covered markets", "Waterfalls (only where it's safe)"];
    tip = "Rain slows travel, so leave early and keep key documents in waterproof covers.";
  } else if (kind === "snow") {
    todo = ["Skiing or snow play", "Scenic train or cable-car rides", "Hot drinks at mountain cafes", "Winter photography"];
    tip = "Check road and pass conditions before driving, and carry chains or travel by train.";
  } else if (kind === "fog") {
    todo = ["Indoor heritage sites", "Cafes and bookstores", "Late-morning sightseeing once it clears", "Slow, scenic walks"];
    tip = "Low visibility: delay long drives until the fog lifts.";
  } else if (band === "hot") {
    todo = ["Early-morning walks or sunrise points", "Water parks or swimming", "Museums and malls at midday", "Evening markets and beaches"];
    tip = "Do outdoor sightseeing before 10 AM or after 4 PM and drink water regularly.";
  } else if (band === "warm") {
    todo = ["Beaches and lakeside spots", "Hiking and nature trails", "Open-air markets and street food", "City sightseeing and photography"];
    tip = "Comfortable conditions: a good time to be outdoors.";
  } else if (band === "cool") {
    todo = ["City walking tours", "Viewpoints and parks", "Heritage sites and old towns", "Cafe hopping"];
    tip = "Pleasant for walking, and layers will keep you comfortable all day.";
  } else {
    todo = ["Indoor attractions and museums", "Hot-spring or spa visits", "Short scenic walks", "Cosy cafes and local food"];
    tip = "It's cold: limit time outdoors and watch for icy surfaces.";
  }
  const pack = [];
  if (band === "hot") pack.push("Light cotton clothing", "Hat and sunglasses", "Water bottle");
  if (band === "warm") pack.push("Breathable clothes", "Comfortable walking shoes");
  if (band === "cool") pack.push("Light jacket or sweater", "Closed shoes");
  if (band === "cold") pack.push("Warm coat, gloves and scarf", "Thermal layers");
  if (kind === "rain" || kind === "storm" || precip >= 50) pack.push("Umbrella or raincoat", "Waterproof bag cover");
  if (kind === "snow") pack.push("Waterproof boots", "Warm socks");
  if (uv >= 6 && kind !== "rain" && kind !== "storm") pack.push("Sunscreen (SPF 30+)");
  if (wind > 25) pack.push("Windcheater");
  return { todo, pack: [...new Set(pack)], tip };
}
