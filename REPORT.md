# Project Report: Smart Weather & Travel Dashboard

**Student:** A.P. Priyadharshini  |  **Course:** B.Tech IT, Prathyusha Engineering College
**Technologies:** HTML5, CSS3, JavaScript (ES6+), Open-Meteo API, Git/GitHub

## 1. Abstract
This project is a responsive web application that fetches real-time weather for any city, shows a 7-day forecast with animated weather icons, and turns the data into practical travel suggestions: whether it is a good day to travel, the best day this week, activities to do, and what to pack.

## 2. Objectives
- Integrate a public REST API using asynchronous JavaScript (`async/await`, `fetch`)
- Present data clearly through a responsive, accessible interface
- Apply rule-based logic to convert raw weather data into useful recommendations
- Follow Git/GitHub workflow with meaningful commits and documentation

## 3. Technology choices
| Area | Choice | Reason |
|---|---|---|
| Weather data | Open-Meteo Forecast + Geocoding APIs | Free, no API key, current + daily forecast |
| Language | ES6+ JavaScript | `async/await`, arrow functions, destructuring, template literals, optional chaining |
| Styling | CSS3 Grid/Flexbox, custom properties | Responsive layout and weather-based theming |
| Icons | Inline SVG + CSS animation | Sharp at any size, no image files |
| Hosting | GitHub Pages | Free static hosting |

## 4. System design
```
User input -> validateCity() -> geocode() -> getForecast() -> render()
                                                   |-> describeCode() / weatherIcon()   (icons.js)
                                                   |-> scoreDay() / suggestionsFor()    (travel.js)
```
- `js/icons.js`: maps WMO weather codes to a condition kind and animated SVG
- `js/travel.js`: scoring and suggestion rules
- `js/app.js`: API calls, validation, state (unit, place, data), rendering, recent searches

## 5. Features
1. **City search** with validation and recent-search chips (`localStorage`)
2. **Current weather:** temperature, feels-like, humidity, wind, UV
3. **7-day forecast** with high/low, rain chance and a travel badge
4. **Dynamic icons and themes:** icon and background change with condition and day/night
5. **Travel suggestions:** daily verdict, best day of the week, activities, packing list, safety tip
6. **Responsive UI:** card layout adapts to phones; forecast becomes a swipeable row
7. **°C/°F toggle**

## 6. Travel scoring logic
Each day starts at 100 points. Points are deducted for rain probability, thunderstorms, heavy rain, snow, fog, extreme heat (above 34 °C), cold (below 5 °C), strong wind and high UV. Score 75 or above is "Great", 50-74 is "Okay", below 50 is "Poor".

## 7. Error handling
Empty or invalid input, unknown city, offline/network failure, 8-second timeout, HTTP errors and missing data each produce a specific, readable message.

## 8. Testing
| Test | Input | Expected result |
|---|---|---|
| Valid city | Chennai | Weather, forecast and suggestions appear |
| Empty input | (blank) | "Enter a city name" message |
| Invalid characters | 12345 | "Use letters only" message |
| Unknown city | Xyzabc | "No city found" message |
| Offline | Disconnect network | "Couldn't reach the weather service" |
| Unit toggle | Click °C/°F | All temperatures convert |
| Mobile view | Width below 760 px | Single-column layout, scrollable forecast |

## 9. Challenges and solutions
- **Mapping weather codes to icons:** created `describeCode()` to group WMO codes into seven icon kinds.
- **Making advice meaningful:** combined temperature bands with condition type rather than showing one generic tip.
- **Slow or failed requests:** added `AbortController` timeout and distinct error messages.

## 10. Future enhancements
Hourly forecast, geolocation, multi-city comparison, a React version with components and hooks, and a weather map.

## 11. Conclusion
The project demonstrates asynchronous programming, API integration and responsive design, and shows how raw API data can become useful decisions for the user.

## 12. References
Open-Meteo documentation (open-meteo.com/en/docs); MDN Web Docs (fetch, async/await, CSS Grid).
