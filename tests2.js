// tests.js
describe('Air Quality Map Functions', () => {
    const mockData = [
        {
            city: 'Zurich',
            lat: 47.3769,
            lng: 8.5417,
            parameters: ['pm25', 'no2'],
            lastUpdated: '2024-05-28 10:00:00+00',
            firstUpdated: '2024-01-01 10:00:00+00'
        },
        {
            city: 'Geneva',
            lat: 46.2044,
            lng: 6.1432,
            parameters: ['pm10', 'o3'],
            lastUpdated: '2024-05-28 10:00:00+00',
            firstUpdated: '2024-01-01 10:00:00+00'
        }
    ];

    test('fetchAirQualityData fetches and updates map', () => {
        const mockFetch = jest.fn().mockImplementation(() => 
            Promise.resolve({
                json: () => Promise.resolve({ results: mockData })
            })
        );
        global.fetch = mockFetch;

        return fetchAirQualityData().then(() => {
            expect(mockFetch).toHaveBeenCalledWith('YOUR_API_ENDPOINT');
            expect(markers.length).toBe(mockData.length);
        });
    });

    test('updateMap adds markers to map', () => {
        document.body.innerHTML = '<div id="map"></div>';
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 46.8182, lng: 8.2275 },
            zoom: 8
        });

        updateMap(mockData);
        expect(markers.length).toBe(mockData.length);
        mockData.forEach((city, index) => {
            expect(markers[index].getTitle()).toBe(city.city);
        });
    });
});
