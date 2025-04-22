const API_KEY = '077c677ebd03a9c6d18395a9711619e2';
const CITY = 'Gorzów Wielkopolski';
const API_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&appid=${API_KEY}&units=metric`;

console.log("Ładuję dane pogodowe...");

function fetchForecast() {
  fetch(API_URL)
    .then(response => {
      console.log("Odpowiedź z API:", response);
      return response.json();
    })
    .then(data => {
      const dailyForecasts = groupForecastsByDay(data.list);
      displayForecasts(dailyForecasts);
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
    card.style.backgroundColor = day.color;
    card.style.padding = '10px';
    card.style.margin = '10px';
    card.style.borderRadius = '10px';
    card.style.color = '#000';
    card.style.fontFamily = 'Arial';

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

document.addEventListener('DOMContentLoaded', fetchForecast);
