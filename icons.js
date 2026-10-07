// Dynamic weather icons: weather code -> animated inline SVG (animation lives in CSS)
const SUN = `<g class="spin" stroke="#ffb627" stroke-width="3" stroke-linecap="round"><path d="M32 6v6M32 52v6M6 32h6M52 32h6M13.6 13.6l4.2 4.2M46.2 46.2l4.2 4.2M13.6 50.4l4.2-4.2M46.2 17.8l4.2-4.2"/></g><circle cx="32" cy="32" r="11" fill="#ffc233"/>`;
const MOON = `<path d="M40 12a20 20 0 1 0 14 32A17 17 0 0 1 40 12z" fill="#f3e9b8"/><circle class="twinkle" cx="50" cy="16" r="1.8" fill="#fff"/><circle class="twinkle" cx="56" cy="28" r="1.3" fill="#fff"/>`;
const CLOUD = (y = 0, fill = "#fff") => `<path class="drift" transform="translate(0 ${y})" d="M19 48a10 10 0 0 1 1-20 14 14 0 0 1 27 3 8.5 8.5 0 0 1-1 17z" fill="${fill}" stroke="#b7c4d1" stroke-width="2"/>`;
const DROPS = `<g stroke="#4f9be8" stroke-width="3" stroke-linecap="round"><path class="drop d1" d="M24 50v6"/><path class="drop d2" d="M33 50v6"/><path class="drop d3" d="M42 50v6"/></g>`;
const FLAKES = `<g fill="#cfe6ff" stroke="#9cc4ee"><circle class="flake d1" cx="24" cy="53" r="2.4"/><circle class="flake d2" cx="33" cy="53" r="2.4"/><circle class="flake d3" cx="42" cy="53" r="2.4"/></g>`;
const BOLT = `<path class="flash" d="M34 42l-8 12h6l-3 8 11-14h-6l4-6z" fill="#ffc233"/>`;
const FOG = `<g stroke="#9fb0c0" stroke-width="4" stroke-linecap="round"><path d="M12 28h40"/><path d="M8 38h40"/><path d="M16 48h38"/></g>`;

// Open-Meteo WMO code -> {kind, label}
function describeCode(code) {
  if (code === 0) return { kind: "clear", label: "Clear sky" };
  if (code === 1) return { kind: "clear", label: "Mostly clear" };
  if (code === 2) return { kind: "partly", label: "Partly cloudy" };
  if (code === 3) return { kind: "cloud", label: "Overcast" };
  if (code === 45 || code === 48) return { kind: "fog", label: "Fog" };
  if ([51, 53, 55, 56, 57].includes(code)) return { kind: "rain", label: "Drizzle" };
  if ([61, 63, 66].includes(code)) return { kind: "rain", label: "Rain" };
  if ([65, 67].includes(code)) return { kind: "rain", label: "Heavy rain" };
  if ([80, 81, 82].includes(code)) return { kind: "rain", label: "Rain showers" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { kind: "snow", label: "Snow" };
  if ([95, 96, 99].includes(code)) return { kind: "storm", label: "Thunderstorm" };
  return { kind: "cloud", label: "Unknown" };
}

function weatherIcon(kind, isDay = true) {
  const art = {
    clear: isDay ? SUN : MOON,
    partly: (isDay ? `<g transform="translate(-6 -8) scale(.75)">${SUN}</g>` : `<g transform="translate(-6 -6) scale(.8)">${MOON}</g>`) + CLOUD(2),
    cloud: CLOUD(0, "#eef2f6"),
    fog: CLOUD(-6) + FOG.replace('d="M12 28h40"', 'd="M12 40h40"').replace('d="M8 38h40"', 'd="M8 48h40"').replace('d="M16 48h38"', 'd="M16 56h38"'),
    rain: CLOUD(-6, "#e3e9ef") + DROPS,
    snow: CLOUD(-6, "#eef2f6") + FLAKES,
    storm: CLOUD(-8, "#cdd5de") + BOLT,
  }[kind];
  return `<svg viewBox="0 0 64 64" role="img" aria-hidden="true" class="wx wx-${kind}">${art}</svg>`;
}
