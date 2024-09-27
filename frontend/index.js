import { backend } from 'declarations/backend';

const API_KEY = 'your_actual_api_key_here'; // Replace with your actual OpenWeatherMap API key
const weatherInfoDiv = document.getElementById('weatherInfo');
const recentQueriesDiv = document.getElementById('recentQueries');
const zipCodeInput = document.getElementById('zipCode');
const getWeatherButton = document.getElementById('getWeather');

getWeatherButton.addEventListener('click', getWeather);

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

        console.log('Fetching weather data...');
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},us&appid=${API_KEY}&units=imperial`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Weather data received:', data);

        if (data.cod === '404') {
            weatherInfoDiv.innerHTML = '<p>City not found. Please check the ZIP code.</p>';
        } else if (data && data.main && data.weather) {
            const weatherHtml = `
                <h2>${data.name}</h2>
                <p>Temperature: ${data.main.temp}°F</p>
                <p>Feels like: ${data.main.feels_like}°F</p>
                <p>Weather: ${data.weather[0].description}</p>
                <p>Humidity: ${data.main.humidity}%</p>
            `;
            weatherInfoDiv.innerHTML = weatherHtml;
        } else {
            throw new Error('Invalid API response');
        }

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
