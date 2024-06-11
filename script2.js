mapboxgl.accessToken = 'pk.eyJ1Ijoic2NodWxwcm9qZWt0MjAyNCIsImEiOiJjbHdxZWI1dGowMWhsMmpzNmtuYmNhMGI0In0.u8jyMsLRqxqj78upp4Cjaw';
const aqicnAPIKey = '655cf8594024de05dbc820f980aba37f23e6d059'; // Your AQICN API key
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

    document.getElementById('city-search').addEventListener('change', function(event) {
        const searchTerm = event.target.value.toLowerCase();
        if (searchTerm.length > 2) {
            fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchTerm)}.json?access_token=${mapboxgl.accessToken}&country=CH&limit=1`)
                .then(response => response.json())
                .then(data => {
                    if (data.features && data.features.length > 0) {
                        const city = data.features[0];
                        map.flyTo({
                            center: city.center,
                            zoom: 12,
                            speed: 1.5, // Adjust the speed of the animation
                            curve: 1 // Adjust the curve of the animation
                        });

                        // Optional: Update city info
                        const cityInfo = document.getElementById('city-info');
                        cityInfo.innerHTML = `<h3>${city.place_name}</h3>`;
                    } else {
                        alert('Keine Stadt gefunden.');
                    }
                })
                .catch(error => console.error('Fehler beim Abrufen der Daten:', error));
        }
    });
}

function fetchAirQualityData() {
    fetch(`https://api.waqi.info/map/bounds/?latlng=45.818,5.955,47.808,10.492&token=${aqicnAPIKey}`)
        .then(response => response.json())
        .then(data => updateMap(data.data))
        .catch(error => console.error('Fehler beim Abrufen der Daten:', error));
}

function updateMap(stations) {
    markers.forEach(marker => marker.remove());
    markers = [];

    stations.forEach(station => {
        if (station.lat && station.lon) {
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.backgroundColor = '#00e400';
            el.style.width = '20px';
            el.style.height = '20px';
            el.style.borderRadius = '50%';

            const marker = new mapboxgl.Marker(el)
                .setLngLat([station.lon, station.lat])
                .setPopup(new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`<div>
                        <h2>${station.station.name}</h2>
                        <p>Luftqualität: AQI ${station.aqi}</p>
                        <canvas id="chart-${station.uid}" width="400" height="200"></canvas>
                    </div>`))
                .addTo(map);

            marker.getElement().addEventListener('click', () => {
                const chartId = `chart-${station.uid}`;
                setTimeout(() => {
                    const canvasElement = document.getElementById(chartId);
                    if (canvasElement) {
                        displayChart(chartId, station);
                    } else {
                        console.error(`Canvas with id ${chartId} not found`);
                    }
                }, 300);
            });

            markers.push(marker);
        }
    });
}

function displayChart(chartId, station) {
    const ctx = document.getElementById(chartId).getContext('2d');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
                datasets: [{
                    label: 'Luftqualität',
                    data: Array(12).fill(station.aqi), // Example values, replace with real historical data
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
