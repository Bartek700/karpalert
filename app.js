// app.js

const API_KEY = '077c677ebd03a9c6d18395a9711619e2';
const CITY = 'Gorzów Wielkopolski';
const API_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&appid=${API_KEY}&units=metric&lang=pl`;

const forecastContainer = document.getElementById('forecast');

fetch(API_URL)
  .then(response => response.json())
  .then(data => {
    const dailyData = processForecast(data.list);
    renderForecast(dailyData);
  });

function processForecast(forecastList) {
  const daily = {};

  forecastList.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!daily[date]) daily[date] = [];
    daily[date].push(item);
  });

  const result = Object.entries(daily).slice(0, 5).map(([date, entries], index, arr) => {
    const temps = entries.map(e => e.main.temp);
    const winds = entries.map(e => e.wind.speed);
    const clouds = entries.map(e => e.clouds.all);
    const pressures = entries.map(e => e.main.pressure);
    const rains = entries.map(e => e.rain ? (e.rain['3h'] || 0) : 0);

    const avgTemp = average(temps);
    const avgWind = average(winds);
    const avgClouds = average(clouds);
    const avgPressure = average(pressures);
    const totalRain = rains.reduce((a, b) => a + b, 0);

    let pressureTrend = 'stabilne';
    if (index > 0 && arr[index - 1]) {
      const prevPressure = average(arr[index - 1][1].map(e => e.main.pressure));
      const diff = avgPressure - prevPressure;
      if (Math.abs(diff) > 5) pressureTrend = diff > 0 ? 'rośnie' : 'spada';
    }

    const score = calculateFishingScore(avgTemp, avgWind, avgClouds, totalRain, avgPressure, pressureTrend);
    const description = generateDescription(score, pressureTrend);

    return {
      date,
      avgTemp,
      avgWind,
      avgClouds,
      avgPressure,
      totalRain,
      pressureTrend,
      score,
      description
    };
  });

  return result;
}

function renderForecast(data) {
  forecastContainer.innerHTML = '';
  data.forEach(day => {
    const dayEl = document.createElement('div');
    dayEl.className = 'forecast-day';
    dayEl.innerHTML = `
      <h3>${day.date}</h3>
      <p>Temperatura: ${day.avgTemp.toFixed(1)}°C</p>
      <p>Wiatr: ${day.avgWind.toFixed(1)} m/s</p>
      <p>Zachmurzenie: ${day.avgClouds.toFixed(0)}%</p>
      <p>Ciśnienie: ${day.avgPressure.toFixed(0)} hPa (${day.pressureTrend})</p>
      <p>Opady: ${day.totalRain.toFixed(1)} mm</p>
      <p><strong>Ocena brań: ${day.score}/100</strong></p>
      <p>${day.description}</p>
    `;
    forecastContainer.appendChild(dayEl);
  });
}

function calculateFishingScore(temp, wind, clouds, rain, pressure, trend) {
  let score = 50;

  if (temp >= 18 && temp <= 25) score += 15;
  else if (temp >= 14 && temp <= 27) score += 5;
  else score -= 10;

  if (wind <= 3) score += 10;
  else if (wind <= 6) score += 5;
  else score -= 5;

  if (clouds >= 40 && clouds <= 70) score += 10;
  else score += 3;

  if (rain < 1) score += 10;
  else if (rain < 5) score += 3;
  else score -= 10;

  if (pressure >= 1013 && pressure <= 1025) score += 15;
  else if (pressure >= 1005 && pressure <= 1030) score += 5;
  else score -= 10;

  if (trend === 'stabilne') score += 15;
  else if (trend === 'rośnie') score += 5;
  else if (trend === 'spada') score -= 10;

  return Math.max(1, Math.min(100, Math.round(score)));
}

function generateDescription(score, pressureTrend) {
  if (score >= 80) return `Znakomite warunki – ryby żerują aktywnie (${pressureTrend} ciśnienie).`;
  if (score >= 60) return `Dobre warunki – warto iść na ryby (${pressureTrend} ciśnienie).`;
  if (score >= 40) return `Średnie warunki – trzeba kombinować (${pressureTrend} ciśnienie).`;
  return `Słabe warunki – karp odpoczywa (${pressureTrend} ciśnienie).`;
}

function average(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
