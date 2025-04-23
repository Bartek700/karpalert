document.addEventListener('DOMContentLoaded', fetchForecast);

async function fetchForecast() {
  const res = await fetch('https://api.openweathermap.org/data/2.5/forecast?lat=52.73&lon=15.24&appid=TWÓJ_KLUCZ_API&units=metric&lang=pl');
  const data = await res.json();
  const entries = data.list;

  drawHourlyPressureChart(entries); // Wykres 3-dniowy

  const groupedByDay = {};

  entries.forEach(entry => {
    const date = new Date(entry.dt * 1000).toLocaleDateString('pl-PL');
    if (!groupedByDay[date]) {
      groupedByDay[date] = [];
    }
    groupedByDay[date].push(entry);
  });

  const result = Object.entries(groupedByDay).map(([date, entries]) => {
    const pressures = entries.map(e => e.main.pressure);
    const avg = pressures.reduce((a, b) => a + b, 0) / pressures.length;
    const min = Math.min(...pressures);
    const max = Math.max(...pressures);
    const stable = max - min <= 3;

    let rating = 'Brak danych';
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

  displayForecasts(result);
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
    card.style.width = '220px';

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
      scales: {
        x: {
          title: {
            display: true,
            text: 'Data i godzina'
          },
          ticks: {
            maxRotation: 90,
            minRotation: 45
          }
        },
        y: {
          title: {
            display: true,
            text: 'Ciśnienie (hPa)'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Wykres ciśnienia – 3 dni do przodu'
        },
        legend: {
          display: false
        }
      }
    }
  });
}
