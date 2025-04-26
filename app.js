const apiKey = '077c677ebd03a9c6d18395a9711619e2';
const city = 'Gorzów Wielkopolski';

async function getWeatherData() {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
  const data = await response.json();
  return data;
}

function calculateRating(temp, pressureChange, wind, rain, clouds) {
  let score = 0;
  let description = "";

  // Temperatura: główny filtr
  let tempOK = temp >= 18 && temp <= 25;
  if (tempOK) {
    score += 30;
  } else {
    description += "Temperatura poza idealnym zakresem. ";
  }

  // Ciśnienie - stabilność
  if (pressureChange <= 5) {
    score += 30;
  } else if (pressureChange <= 8) {
    score -= 30;
    description += "Średnie wahania ciśnienia. ";
  } else {
    score -= 60;
    description += "Duże wahania ciśnienia! ";
  }

  // Wiatr
  if (wind >= 1 && wind <= 3) {
    score += 15;
  } else if (wind > 6) {
    score -= 10;
    description += "Silny wiatr. ";
  }

  // Opady
  if (rain < 1) {
    score += 10;
  } else if (rain > 3) {
    score -= 10;
    description += "Zbyt duże opady. ";
  }

  // Zachmurzenie
  if (clouds >= 40 && clouds <= 70) {
    score += 10;
  }

  if (!tempOK && score > 70) score = 70;
  if (score > 100) score = 100;
  if (score < 0) score = 0;

  return { score: Math.round(score), description };
}

function displayForecast(forecastList) {
  const container = document.getElementById('forecast');
  container.innerHTML = '';
  let previousPressure = null;

  for (let i = 0; i < forecastList.length; i += 8) {
    const dayData = forecastList[i];
    const date = new Date(dayData.dt_txt).toLocaleDateString();
    const temp = dayData.main.temp;
    const pressure = dayData.main.pressure;
    const wind = dayData.wind.speed;
    const rain = dayData.rain ? dayData.rain['3h'] || 0 : 0;
    const clouds = dayData.clouds.all;

    let pressureChange = 0;
    if (previousPressure !== null) {
      pressureChange = Math.abs(pressure - previousPressure);
    }
    previousPressure = pressure;

    const { score, description } = calculateRating(temp, pressureChange, wind, rain, clouds);

    const entry = document.createElement('div');
    entry.className = 'day';
    entry.innerHTML = `
      <h3>${date}</h3>
      <p>Temperatura: ${temp}°C</p>
      <p>Ciśnienie: ${pressure} hPa (zmiana: ${pressureChange.toFixed(1)} hPa)</p>
      <p>Wiatr: ${wind} m/s</p>
      <p>Opady: ${rain} mm</p>
      <p>Zachmurzenie: ${clouds}%</p>
      <h4>Ocena: ${score}/100</h4>
      <p>${description || "Dobre warunki na połów."}</p>
    `;
    container.appendChild(entry);
  }
}

getWeatherData().then(data => {
  displayForecast(data.list);
});
