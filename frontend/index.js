import { backend } from 'declarations/backend';

const weatherInfoDiv = document.getElementById('weatherInfo');
const recentQueriesDiv = document.getElementById('recentQueries');
const zipCodeInput = document.getElementById('zipCode');
const getWeatherButton = document.getElementById('getWeather');

getWeatherButton.addEventListener('click', getWeather);

function generateMockWeather(zipCode) {
    const temp = Math.floor(Math.random() * 50) + 30; // Random temperature between 30 and 80
    const feelsLike = temp + Math.floor(Math.random() * 10) - 5; // Feels like temperature within 5 degrees of actual
    const humidity = Math.floor(Math.random() * 60) + 20; // Random humidity between 20 and 80
    const conditions = ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy', 'Windy'][Math.floor(Math.random() * 5)];
    
    return {
        name: `City (${zipCode})`,
        main: {
            temp,
            feels_like: feelsLike,
            humidity
        },
        weather: [{ description: conditions }]
    };
}

async function getWeather() {
    const zipCode = zipCodeInput.value.trim();
    if (!zipCode) {
        alert('Please enter a ZIP code');
        return;
    }

    if (!weatherInfoDiv) {
        console.error('Weather info div not found');
        return;
    }

    weatherInfoDiv.innerHTML = '<p>Loading weather data...</p>';

    try {
        console.log('Checking rate limit...');
        const canProceed = await backend.addQuery(zipCode);
        if (!canProceed) {
            weatherInfoDiv.innerHTML = '<p>Rate limit exceeded. Please try again later.</p>';
            return;
        }

        console.log('Generating mock weather data...');
        const data = generateMockWeather(zipCode);
        console.log('Weather data generated:', data);

        const weatherHtml = `
            <h2>${data.name}</h2>
            <p>Temperature: ${data.main.temp}°F</p>
            <p>Feels like: ${data.main.feels_like}°F</p>
            <p>Weather: ${data.weather[0].description}</p>
            <p>Humidity: ${data.main.humidity}%</p>
        `;
        weatherInfoDiv.innerHTML = weatherHtml;

        updateRecentQueries();
    } catch (error) {
        console.error('Error:', error);
        weatherInfoDiv.innerHTML = `<p>An error occurred: ${error.message}. Please try again later.</p>`;
    }
}

async function updateRecentQueries() {
    if (!recentQueriesDiv) {
        console.error('Recent queries div not found');
        return;
    }

    try {
        console.log('Fetching recent queries...');
        const queries = await backend.getRecentQueries();
        console.log('Recent queries:', queries);
        const queriesHtml = queries.map(query => `<li>${query}</li>`).join('');
        recentQueriesDiv.innerHTML = `
            <h3>Recent Queries</h3>
            <ul>${queriesHtml}</ul>
        `;
    } catch (error) {
        console.error('Error fetching recent queries:', error);
        recentQueriesDiv.innerHTML = '<p>Unable to fetch recent queries.</p>';
    }
}

// Initial load of recent queries
updateRecentQueries();

console.log('Weather app initialized');
