let forecastChart, hourlyChart;
let historyList = [];

document.getElementById("weatherForm").addEventListener("submit", function(e) {
    e.preventDefault();
    getWeather(document.getElementById("city").value);
});

document.getElementById("locBtn").addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            getWeather(null, pos.coords.latitude, pos.coords.longitude);
        });
    }
});

// Fetch weather from backend
async function getWeather(city, lat=null, lon=null) {
    let url = `/weather?city=${city || ""}&lat=${lat || ""}&lon=${lon || ""}`;
    let response = await fetch(url);
    let data = await response.json();

    if (data.error) {
        document.getElementById("currentData").innerHTML = `<p style="color:red">${data.error}</p>`;
        return;
    }

    // Save to search history
    if (city && !historyList.includes(city)) {
        historyList.push(city);
        updateHistory();
    }

    // Current Weather
    document.getElementById("currentData").innerHTML = `
        <h3>${data.city}, ${data.country}</h3>
        <img src="http://openweathermap.org/img/wn/${data.icon}@2x.png">
        <p>🌡️ Temp: ${data.temp}°C (Feels like: ${data.feels_like}°C)</p>
        <p>${data.description}</p>
    `;

    // Extra details
    document.getElementById("detailsData").innerHTML = `
        <p>💧 Humidity: ${data.humidity}%</p>
        <p>🌬️ Wind: ${data.wind} m/s</p>
        <p>🌄 Sunrise: ${data.sunrise}</p>
        <p>🌇 Sunset: ${data.sunset}</p>
        <p>🎯 Pressure: ${data.pressure} hPa</p>
        <p>👀 Visibility: ${data.visibility / 1000} km</p>
    `;

    // Change background by weather
    if (data.main === "Clear") document.body.style.background = "linear-gradient(to right, #f7971e, #ffd200)";
    else if (data.main === "Rain") document.body.style.background = "linear-gradient(to right, #373b44, #4286f4)";
    else if (data.main === "Clouds") document.body.style.background = "linear-gradient(to right, #bdc3c7, #2c3e50)";
    else document.body.style.background = "linear-gradient(to right, #1f4037, #99f2c8)";

    // Forecast Chart
    updateChart("forecastChart", data.forecast.map(f => f.date), data.forecast.map(f => f.temp), "5-Day Forecast");

    // Hourly Chart
    updateChart("hourlyChart", data.hourly.map(h => h.time), data.hourly.map(h => h.temp), "Next 12 Hours");
}

function updateChart(id, labels, temps, label) {
    let ctx = document.getElementById(id).getContext("2d");
    if (id === "forecastChart" && forecastChart) forecastChart.destroy();
    if (id === "hourlyChart" && hourlyChart) hourlyChart.destroy();

    let chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: temps,
                borderColor: "#ff9800",
                backgroundColor: "rgba(255,152,0,0.3)",
                tension: 0.3,
                fill: true
            }]
        }
    });

    if (id === "forecastChart") forecastChart = chart;
    else hourlyChart = chart;
}

function updateHistory() {
    let list = document.getElementById("searchHistory");
    list.innerHTML = "";
    historyList.forEach(city => {
        let li = document.createElement("li");
        li.textContent = city;
        li.onclick = () => getWeather(city);
        list.appendChild(li);
    });
}
