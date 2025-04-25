// Funkcja do obliczania oceny pogody
function calculateScore(weatherData) {
    let score = 0;

    // Ciśnienie atmosferyczne (1015 - 1025 hPa)
    if (weatherData.pressure >= 1015 && weatherData.pressure <= 1025) {
        score += 25; // Idealne ciśnienie
    } else if (weatherData.pressure > 1025) {
        score += 15; // Wysokie ciśnienie, może być trudniej
    } else {
        score += 10; // Niskie ciśnienie, ryby mogą być mniej aktywne
    }

    // Wiatr (do 15 km/h - optymalnie)
    if (weatherData.wind_speed <= 15) {
        score += 25; // Optymalny wiatr
    } else if (weatherData.wind_speed <= 25) {
        score += 15; // Umiarkowany wiatr
    } else {
        score += 10; // Silny wiatr, mniej sprzyjający
    }

    // Temperatura wody (18-22°C - optymalnie)
    if (weatherData.water_temperature >= 18 && weatherData.water_temperature <= 22) {
        score += 30; // Idealna temperatura
    } else if (weatherData.water_temperature > 22) {
        score += 20; // Wyższa temperatura, może być ok, ale ryby mniej aktywne
    } else {
        score += 15; // Niższa temperatura, ryby mogą być mniej aktywne
    }

    // Opady (brak opadów - optymalnie)
    if (weatherData.rain <= 1) {
        score += 20; // Brak opadów, idealne warunki
    } else if (weatherData.rain <= 5) {
        score += 10; // Umiarkowane opady, mogą nieco przeszkadzać
    } else {
        score += 5; // Silne opady, trudniejsze warunki
    }

    return Math.min(score, 100); // Maksymalna ocena to 100
}

// Funkcja wyświetlająca prognozę oraz ocenę
function displayForecast(data) {
    const forecastDiv = document.getElementById("forecast");
    const score = calculateScore(data);

    // Tworzymy element z oceną
    const scoreElement = document.createElement("div");
    scoreElement.classList.add("score");
    scoreElement.innerHTML = `<h2>Ocena: ${score}/100</h2>`;

    // Tworzymy element z prognozą
    const forecastDetails = document.createElement("div");
    forecastDetails.classList.add("forecast-details");
    forecastDetails.innerHTML = `
        <p><strong>Ciśnienie:</strong> ${data.pressure} hPa</p>
        <p><strong>Wiatr:</strong> ${data.wind_speed} km/h</p>
        <p><strong>Temperatura wody:</strong> ${data.water_temperature}°C</p>
        <p><strong>Opady:</strong> ${data.rain} mm</p>
    `;

    // Dodajemy prognozę i ocenę do strony
    forecastDiv.appendChild(forecastDetails);
    forecastDiv.appendChild(scoreElement);
}

// Przykładowe dane wejściowe
const weatherData = {
    pressure: 1018, // Ciśnienie w hPa
    wind_speed: 10, // Prędkość wiatru w km/h
    water_temperature: 20, // Temperatura wody w °C
    rain: 0 // Opady w mm
};

// Wyświetlenie prognozy z oceną
displayForecast(weatherData);
