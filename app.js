const API_KEY = '077c677ebd03a9c6d18395a9711619e2';
const CITY = 'Gorzów Wielkopolski';
const API_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&appid=${API_KEY}&units=metric&lang=pl`;

document.addEventListener('DOMContentLoaded', fetchForecast);

function fetchForecast() {
  fetch(API_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error('Błąd sieci: Nie udało się pobrać danych');
      }
      return response.json();
    })
    .then(data => {
      console.log("Dane z API:", data);  // Logujemy dane, by sprawdzić, co dokładnie otrzymujemy
      const dailyForecasts = groupForecastsByDay(data.list);
      displayForecasts(dailyForecasts);
      drawHourlyPressureChart(data.list);
    })
    .catch(error => {
      console.error('Błąd podczas pobierania danych pogodowych:', error);
      // Dodajemy dodatkową informację w przypadku błędu
      document.getElementById('forecast').innerHTML = 'Nie udało się załadować prognozy pogody.';
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
    .slice(0, 3)
    .map(([date, entries]) => {
      const pressures = entries.map(e => e.main.pressure);
      const min = Math.min(...pressures);
      const max = Math.max(...pressures);
      const avg = pressures.reduce((a, b) => a + b, 0) / pressures.length;

      const stable = max - min <= 6;

      let rating = 'Bardzo źle';
      let color = 'red';

      if (avg >= 990 && avg <= 1005 && stable) {
        rating = 'Wspaniale';
        color = 'lightgreen';
      } else if (avg >= 990 && avg <= 1005) {
        rating = 'Dobrze';
        color = 'green';
      } else if (avg > 1005 && avg <= 1020 && stable) {
        rating = 'Średnio';
        color = 'yellow';
      } else if (avg > 1020 && avg <= 1030 && stable) {
        rating = 'Słabo';
        color = 'orange';
      }

      return {
        date,
        pressure: Math.round(avg),
        min,
        max,
        stable,
        rating,
        color,
        icon: entries[0].weather[0].icon,
        description: entries[0].weather[0].description
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
      <p><strong>Średnie ciśnienie:</strong> ${day.pressure} hPa</p>
      <p><strong>Zakres:</strong> ${day.min} - ${day.max} hPa</p>
      <p><strong>Stabilność:</strong> ${day.stable ? 'Tak' : 'Nie'}</p>
      <p><strong>Ocena:</strong> ${day.rating}</p>
    `;

    container.appendChild(card);
  });
}

function drawHourlyPressureChart(data) {
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
      labels: labels,
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
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    }
  });
}
