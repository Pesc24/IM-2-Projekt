// script.js
mapboxgl.accessToken = 'pk.eyJ1Ijoic2NodWxwcm9qZWt0MjAyNCIsImEiOiJjbHdxZWI1dGowMWhsMmpzNmtuYmNhMGI0In0.u8jyMsLRqxqj78upp4Cjaw';
const apiURL = 'https://api.openaq.org/v1/latest?country=CH'; // OpenAQ API Endpoint for Switzerland
let map;
let markers = [];

function initMap() {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [8.2275, 46.8182], // Centered on Switzerland
        zoom: 8
    });

    fetchAirQualityData();
    setInterval(fetchAirQualityData, 3600000); // Update every hour

    document.getElementById('city-search').addEventListener('input', function(event) {
        const searchTerm = event.target.value.toLowerCase();
        const cityInfo = document.getElementById('city-info');
        cityInfo.innerHTML = '';

        fetch(apiURL)
            .then(response => response.json())
            .then(data => {
                const filteredCities = data.results.filter(city => 
                    city.city && city.city.toLowerCase().includes(searchTerm)
                );
                if (filteredCities.length > 0) {
                    const city = filteredCities[0];
                    if (city.coordinates) {
                        map.flyTo({ center: [city.coordinates.longitude, city.coordinates.latitude], zoom: 12 });
                    }
                }
                filteredCities.forEach(city => {
                    if (city.coordinates && city.measurements) {
                        const cityElement = document.createElement('div');
                        cityElement.className = 'city';
                        cityElement.innerHTML = `<h3>${city.city}</h3>
                                                 <p>Luftqualität: ${city.measurements.map(m => `${m.parameter}: ${m.value}${m.unit}`).join(', ')}</p>`;
                        cityInfo.appendChild(cityElement);
                    }
                });
            })
            .catch(error => console.error('Fehler beim Abrufen der Daten:', error));
    });
}

function fetchAirQualityData() {
    fetch(apiURL)
        .then(response => response.json())
        .then(data => updateMap(data.results))
        .catch(error => console.error('Fehler beim Abrufen der Daten:', error));
}

function updateMap(cities) {
    markers.forEach(marker => marker.remove());
    markers = [];

    cities.forEach(city => {
        if (city.coordinates && city.measurements) {
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.backgroundColor = '#0277bd';
            el.style.width = '20px';
            el.style.height = '20px';
            el.style.borderRadius = '50%';

            const marker = new mapboxgl.Marker(el)
                .setLngLat([city.coordinates.longitude, city.coordinates.latitude])
                .setPopup(new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`<div>
                        <h2>${city.city}</h2>
                        <p>Luftqualität: ${city.measurements.map(m => `${m.parameter}: ${m.value}${m.unit}`).join(', ')}</p>
                        <canvas id="chart-${city.city ? city.city.replace(/\s/g, '') : 'chart'}" width="400" height="200"></canvas>
                    </div>`))
                .addTo(map);

            marker.getElement().addEventListener('click', () => {
                const chartId = `chart-${city.city ? city.city.replace(/\s/g, '') : 'chart'}`;
                setTimeout(() => {
                    const canvasElement = document.getElementById(chartId);
                    if (canvasElement) {
                        displayChart(chartId, city);
                    } else {
                        console.error(`Canvas with id ${chartId} not found`);
                    }
                }, 300);
            });

            markers.push(marker);
        }
    });
}

function displayChart(chartId, city) {
    const ctx = document.getElementById(chartId).getContext('2d');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
                datasets: [{
                    label: 'Luftqualität',
                    data: city.measurements.map(m => m.value), // Beispielwerte, ersetzen mit echten historischen Daten
                    backgroundColor: 'rgba(2, 119, 189, 0.2)',
                    borderColor: 'rgba(2, 119, 189, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } else {
        console.error(`Canvas with id ${chartId} not found`);
    }
}

// Export functions for testing
window.initMap = initMap;
window.fetchAirQualityData = fetchAirQualityData;
window.updateMap = updateMap;
window.displayChart = displayChart;

// Initialize the map
document.addEventListener('DOMContentLoaded', initMap);
