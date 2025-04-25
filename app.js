const API_KEY = '077c677ebd03a9c6d18395a9711619e2';
const CITY = 'Gorzów Wielkopolski';
const API_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&appid=${API_KEY}&units=metric&lang=pl`;

document.addEventListener('DOMContentLoaded', fetchForecast);

function fetchForecast() {
  fetch(API_URL)
    .then(response => {
      if (!response.ok) throw new Error('Błąd sieci');
      return response.json();
    })
    .then(data => {
      const dailyForecasts = groupForecastsByDay(data.list);
      displayForecasts(dailyForecasts);
      drawPressureChart(data.list);
    })
    .catch(error => {
      console.error('Błąd podczas pobierania danych pogodowych:', error);
    });
}

function groupForecastsByDay(forecasts) {
  const grouped = {};

  forecasts.forEach(forecast => {
    const date = forecast.dt_txt.split(' ')[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(forecast);
  });

  const result = Object.entries(grouped)
    .slice(0, 5)
    .map(([date, entries]) => {
      const temperatures = entries.map(e => e.main.temp);
      const winds = entries.map(e => e.wind.speed);
      const pressures = entries.map(e => e.main.pressure);

      const minTemp = Math.min(...temperatures);
      const maxTemp = Math.max(...temperatures);
      const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
      const avgWind = winds.reduce((a, b) => a + b, 0) / winds.length;
      const minPressure = Math.min(...pressures);
      const maxPressure = Math.max(...pressures);
      const avgPressure = pressures.reduce((a, b) => a + b, 0) / pressures.length;
      const stable = maxPressure - minPressure <= 6;

      const icon = entries[0].weather[0].icon;
      const description = entries[0].weather[0].description;

      // Nowe, bardziej precyzyjne zasady dla karpia i amura
      let rating = 'Bardzo źle';
      let color = 'red';

      if (stable && avgPressure >= 1005 && avgPressure <= 1020 && avgTemp >= 12 && avgTemp <= 22 && avgWind <= 3.5) {
        rating = 'Wspaniale';
        color = 'lightgreen';
      } else if (stable && avgPressure >= 1000 && avgPressure <= 1025 && avgTemp >= 10 && avgTemp <= 25 && avgWind <= 4.5) {
        rating = 'Dobre';
        color = 'green';
      } else if (avgPressure >= 990 && avgPressure <= 1030 && avgTemp >= 8 && avgTemp <= 28 && avgWind <= 6) {
        rating = 'Średnie';
        color = 'yellow';
      } else if (!stable || avgWind > 7 || avgTemp < 6 || avgTemp > 30) {
        rating = 'Złe';
        color = 'orange';
      }

      return {
        date,
        minTemp,
        maxTemp,
        avgTemp,
        avgWind,
        minPressure,
        maxPressure,
        avgPressure,
        stable,
        rating,
        color,
        icon,
        description
      };
    });

  return result;
}

function displayForecasts(forecasts) {
  const container = document.getElementById('forecast');
  container.innerHTML = '';

  forecasts.forEach(day => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.backgroundColor = day.color;

    card.innerHTML = `
      <h3>${day.date}</h3>
      <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="pogoda">
      <p><strong>Opis:</strong> ${day.description}</p>
      <p><strong>Średnia temperatura:</strong> ${day.avgTemp.toFixed(1)} °C</p>
      <p><strong>Średnia prędkość wiatru:</strong> ${day.avgWind.toFixed(1)} m/s</p>
      <p><strong>Średnie ciśnienie:</strong> ${Math.round(day.avgPressure)} hPa</p>
      <p><strong>Zakres temperatury:</strong> ${day.minTemp} - ${day.maxTemp} °C</p>
      <p><strong>Zakres ciśnienia:</strong> ${day.minPressure} - ${day.maxPressure} hPa</p>
      <p><strong>Stabilność:</strong> ${day.stable ? 'Tak' : 'Nie'}</p>
      <p><strong>Ocena:</strong> ${day.rating}</p>
    `;

    container.appendChild(card);
  });
}

function drawPressureChart(data) {
  const ctx = document.getElementById('hourlyPressureChart').getContext('2d');
  const labels = data.map(point =>
    new Date(point.dt * 1000).toLocaleString('pl-PL', {
      hour: '2-digit',
      day: '2-digit',
      month: '2-digit'
    })
  );
  const pressures = data.map(point => point.main.pressure);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Ciśnienie (hPa)',
        data: pressures,
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.1)',
        pointRadius: 2,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: 'Data i godzina' } },
        y: { title: { display: true, text: 'Ciśnienie (hPa)' } }
      }
    }
  });
}
