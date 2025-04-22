const apiKey = '077c677ebd03a9c6d18395a9711619e2';
const lat = 52.7368;  // Gorzów Wielkopolski
const lon = 15.2288;

async function getPressure() {
  const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
  const data = await res.json();
  const pressure = data.main.pressure;
  document.getElementById('pressure').innerText = `Ciśnienie: ${pressure} hPa`;

  let status = '';
  if (pressure >= 990 && pressure <= 1005) {
    status = 'Zielone – Idealne na karpia!';
    document.getElementById('status').style.color = 'green';
  } else if (pressure > 1005 && pressure <= 1016) {
    status = 'Pomarańczowe – Może być dobrze.';
    document.getElementById('status').style.color = 'orange';
  } else {
    status = 'Czerwone – Słabe warunki.';
    document.getElementById('status').style.color = 'red';
  }

  document.getElementById('status').innerText = status;
}

getPressure();
