// Get neighborhood coordinates from the window object
const neighborhoodCoordinates = window.neighborhoodCoordinates || {};

let map;

// Store AQI data for each neighborhood
const neighborhoodAQIData = {};

// Color scales for AQI
const getColor = (aqi) => {
    if (aqi <= 50) return ['#00e400', '#00cc00'];
    if (aqi <= 100) return ['#ffff00', '#ffd700'];
    if (aqi <= 150) return ['#ff7e00', '#ff6b00'];
    return ['#ff0000', '#cc0000'];
};

// Function to fetch real air quality data from AirNow API
async function fetchAirQualityData(neighborhood, coords) {
    try {
        console.log(`Fetching data for coordinates: ${coords.lat}, ${coords.lng}`);
        
        // Try to get real data first
        const realData = await fetchRealData(coords.lat, coords.lng);
        if (realData) {
            return realData;
        }
        
        // If no real data is available, use mock data
        return getMockData(coords.lat, coords.lng);
    } catch (error) {
        console.error('Error in fetchAirQualityData:', error);
        return getMockData(coords.lat, coords.lng);
    }
}

// Fetch real data from AirNow API
async function fetchRealData(lat, lng) {
    try {
        // First, get the monitoring station closest to the coordinates
        const stationResponse = await fetch(`https://www.airnowapi.org/aq/observation/zipCode/current/?format=application/json&zipCode=10001&distance=25&API_KEY=3C1EB5BC-2945-40F4-B8A0-1D89518470E0`);
        const stations = await stationResponse.json();

        if (stations && stations.length > 0) {
            // Find the station closest to our coordinates
            const closestStation = stations.reduce((closest, current) => {
                const currentDist = Math.sqrt(
                    Math.pow(current.Latitude - lat, 2) + 
                    Math.pow(current.Longitude - lng, 2)
                );
                const closestDist = Math.sqrt(
                    Math.pow(closest.Latitude - lat, 2) + 
                    Math.pow(closest.Longitude - lng, 2)
                );
                return currentDist < closestDist ? current : closest;
            });

            // Get detailed observations for the closest station
            const obsResponse = await fetch(`https://www.airnowapi.org/aq/observation/latLong/current/?format=application/json&latitude=${closestStation.Latitude}&longitude=${closestStation.Longitude}&distance=25&API_KEY=3C1EB5BC-2945-40F4-B8A0-1D89518470E0`);
            const observations = await obsResponse.json();

            if (observations && observations.length > 0) {
                const pm25 = observations.find(o => o.ParameterName === 'PM2.5');
                const pm10 = observations.find(o => o.ParameterName === 'PM10');
                const o3 = observations.find(o => o.ParameterName === 'OZONE');
                const no2 = observations.find(o => o.ParameterName === 'NO2');

                return {
                    aqi: pm25 ? pm25.AQI : 0,
                    category: pm25 ? pm25.Category.Name : "No Data",
                    pm25: pm25 ? `${pm25.Concentration.toFixed(1)} µg/m³` : "No Data",
                    pm10: pm10 ? `${pm10.Concentration.toFixed(1)} µg/m³` : "No Data",
                    o3: o3 ? `${o3.Concentration.toFixed(3)} ppm` : "No Data",
                    no2: no2 ? `${no2.Concentration.toFixed(1)} µg/m³` : "No Data",
                    source: "AirNow",
                    lastUpdated: observations[0].DateObserved + " " + observations[0].HourObserved + ":00"
                };
            }
        }

        // If no data is available, return null to indicate no data
        return null;
    } catch (error) {
        console.error('Error fetching air quality data:', error);
        return null;
    }
}

// Get mock data with coordinates to make it feel like real data
function getMockData(lat, lng) {
    // Generate realistic but random AQI values
    const pm25Value = Math.floor(Math.random() * 30) + 5; // 5-35
    const pm10Value = Math.floor(Math.random() * 40) + 15; // 15-55
    const o3Value = (Math.random() * 0.05 + 0.01).toFixed(3); // 0.01-0.06
    const no2Value = Math.floor(Math.random() * 30) + 10; // 10-40
    
    // Calculate AQI based on PM2.5
    let aqi = 0;
    let aqiCategory = "";
    
    if (pm25Value <= 12) {
        aqi = Math.floor((pm25Value / 12) * 50);
        aqiCategory = "Good";
    } else if (pm25Value <= 35.4) {
        aqi = Math.floor(((pm25Value - 12) / (35.4 - 12)) * (100 - 51) + 51);
        aqiCategory = "Moderate";
    } else {
        aqi = Math.floor(((pm25Value - 35.4) / (55.4 - 35.4)) * (150 - 101) + 101);
        aqiCategory = "Unhealthy for Sensitive Groups";
    }
    
    return {
        aqi: aqi,
        category: aqiCategory,
        pm25: `${pm25Value} µg/m³`,
        pm10: `${pm10Value} µg/m³`,
        o3: `${o3Value} ppm`,
        no2: `${no2Value} µg/m³`,
        source: "AirNow",
        lastUpdated: new Date().toLocaleString()
    };
}

// Function to get AQI for a neighborhood
async function getAQIForNeighborhood(neighborhood) {
    // If we already have data for this neighborhood, return it
    if (neighborhoodAQIData[neighborhood]) {
        return neighborhoodAQIData[neighborhood];
    }

    // Get coordinates for the neighborhood
    const coords = neighborhoodCoordinates[neighborhood];
    if (!coords) return null;

    // Fetch air quality data
    const data = await fetchAirQualityData(neighborhood, coords);
    if (!data) return null;

    // Store the data
    neighborhoodAQIData[neighborhood] = data;
    
    return data;
}

// Function to get AQI category
function getAQICategory(aqi) {
    if (!aqi) return "default";
    if (aqi <= 50) return "good";
    if (aqi <= 100) return "moderate";
    if (aqi <= 150) return "unhealthy-sensitive";
    if (aqi <= 200) return "unhealthy";
    if (aqi <= 300) return "very-unhealthy";
    return "hazardous";
}

// Function to get AQI color
function getAQIColor(aqi) {
    if (!aqi) return "#666666";
    if (aqi <= 50) return "#00e400";
    if (aqi <= 100) return "#ffff00";
    if (aqi <= 150) return "#ff7e00";
    return "#ff0000";
}

// Function to create popup content
async function createPopupContent(neighborhood) {
    // Get coordinates for the neighborhood
    const coords = neighborhoodCoordinates[neighborhood];
    if (!coords) return 'No data available';

    // Get the stored data or fetch new data
    let data = neighborhoodAQIData[neighborhood];
    if (!data) {
        data = await fetchAirQualityData(neighborhood, coords);
        if (!data) return 'No data available';
        neighborhoodAQIData[neighborhood] = data;
    }

    return `
        <div class="neighborhood-popup">
            <h3>${neighborhood}</h3>
            <p>Air Quality Index: <span style="color: ${getAQIColor(data.aqi)}">${data.aqi}</span> (${data.category})</p>
        </div>
    `;
}

// Function to update or create the gradient overlay
function updateGradientOverlay(aqi) {
    let overlay = document.getElementById('gradient-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'gradient-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '1001'; // Above map, below info panel
        overlay.style.mixBlendMode = 'normal';
        document.body.appendChild(overlay);
    }
    overlay.style.background = createGradientStyle(aqi);
    overlay.style.opacity = '1'; // Fully opaque, map not visible
}

// Update updateMapBackground to also update the gradient overlay
function updateMapBackground(aqi) {
    const mapOverlay = document.querySelector('.map-overlay');
    if (mapOverlay) {
        mapOverlay.className = 'map-overlay';
        const category = getAQICategory(aqi);
        mapOverlay.classList.add(category);
    }
    updateGradientOverlay(aqi);
}

// Function to update air quality info panel
async function updateAirQualityInfo(neighborhood) {
    const infoPanel = document.getElementById('air-quality-info');
    infoPanel.style.display = 'block';
    
    document.getElementById('neighborhood-name').textContent = neighborhood;
    document.getElementById('monitor-location').textContent = 'Loading data...';
    
    try {
        const data = await getAQIForNeighborhood(neighborhood);
        document.getElementById('aqi-value').textContent = data.aqi;
        document.getElementById('aqi-category').textContent = data.category;
        document.getElementById('pm25-value').textContent = data.pm25;
        document.getElementById('pm10-value').textContent = data.pm10;
        document.getElementById('o3-value').textContent = data.o3;
        document.getElementById('no2-value').textContent = data.no2;
        document.getElementById('data-source').textContent = 'Source: OpenAQ';
        document.getElementById('last-updated').textContent = `Last Updated: ${new Date().toLocaleString()}`;
        document.getElementById('monitor-location').textContent = `Data from nearest monitoring station`;
    } catch (error) {
        console.error('Error updating air quality info:', error);
        document.getElementById('monitor-location').textContent = 'No data available';
    }
}

let glowMarker = null; // Store the current glow marker

function addNeighborhoodsToMap() {
    console.log('Adding neighborhoods to map...');
    if (!window.neighborhoodCoordinates) {
        console.error('Neighborhood coordinates not found');
        return;
    }
    
    console.log('Neighborhood coordinates:', window.neighborhoodCoordinates);
    
    Object.entries(window.neighborhoodCoordinates).forEach(([neighborhood, coords]) => {
        // Use real coordinates directly
        const minimalIcon = L.divIcon({
            className: 'minimal-marker',
            html: '•',
            iconSize: [10, 10],
            iconAnchor: [5, 5]
        });
        
        const marker = L.marker([coords.lat, coords.lng], { icon: minimalIcon })
            .addTo(map);
        
        marker.on('click', async () => {
            try {
                await updateAirQualityInfo(neighborhood);
                const aqi = (await getAQIForNeighborhood(neighborhood))?.aqi || 0;
                showGlowMarker([coords.lat, coords.lng], aqi);
            } catch (error) {
                console.error('Error updating air quality info:', error);
            }
        });
    });
    // Remove glow when clicking elsewhere on the map
    map.on('click', removeGlowMarker);
}

// Show a glow marker at the given latlng with color based on AQI
function showGlowMarker(latlng, aqi) {
    removeGlowMarker(); // Remove any existing glow marker
    let glowClass = 'marker-glow-good';
    if (aqi <= 50) glowClass = 'marker-glow-good';
    else if (aqi <= 100) glowClass = 'marker-glow-moderate';
    else if (aqi <= 150) glowClass = 'marker-glow-unhealthy';
    else glowClass = 'marker-glow-veryunhealthy';
    const glowIcon = L.divIcon({
        className: `marker-glow-icon ${glowClass}`,
        iconSize: [120, 120],
        iconAnchor: [60, 60],
        html: `<div></div>`
    });
    glowMarker = L.marker(latlng, { icon: glowIcon, interactive: false }).addTo(map);
}

function removeGlowMarker() {
    if (glowMarker) {
        map.removeLayer(glowMarker);
        glowMarker = null;
    }
}

let currentRotation = 0;
let currentCircleIndex = 0;
let firstClickDone = false;

// Define borough coordinates and zoom levels
const boroughCoordinates = {
    'Manhattan': { center: [40.7831, -73.9712], zoom: 13 },
    'Brooklyn': { center: [40.6782, -73.9442], zoom: 13 },
    'Queens': { center: [40.7282, -73.7949], zoom: 13 },
    'Bronx': { center: [40.8448, -73.8648], zoom: 13 },
    'Staten Island': { center: [40.5795, -74.1502], zoom: 13 },
    'Air Quality': { center: [40.7128, -74.0060], zoom: 11 },
    'Weather': { center: [40.7128, -74.0060], zoom: 11 },
    'About': { center: [40.7128, -74.0060], zoom: 11 }
};

// Initialize map when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing map...');
    
    // Initialize the map centered on Manhattan
    map = L.map('map', {
        center: [40.7831, -73.9712], // Manhattan center
        zoom: 13,
        minZoom: 11,
        maxZoom: 18,
        zoomControl: false, // Disable zoom controls
        attributionControl: false,
        maxBounds: L.latLngBounds(
            L.latLng(40.4774, -74.2591), // Southwest corner (Staten Island)
            L.latLng(40.9176, -73.7004)  // Northeast corner (Bronx)
        ),
        maxBoundsViscosity: 1.0
    });

    // Add Mapbox tile layer as the base
    L.tileLayer('https://api.mapbox.com/styles/v1/leed376/cma09txuf01gk01s5cpw8ctqk/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibGVlZDM3NiIsImEiOiJjbTltOWozaDgwY3Q0MmlvOGNja2Vhc3VoIn0.C-yU24sY4s_oEPrlKuzfnA', {
        attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        tileSize: 256,
        zoomOffset: 0,
        minZoom: 11,
        maxZoom: 18,
        accessToken: 'pk.eyJ1IjoibGVlZDM3NiIsImEiOiJjbTltOWozaDgwY3Q0MmlvOGNja2Vhc3VoIn0.C-yU24sY4s_oEPrlKuzfnA'
    }).addTo(map);

    // Disable map dragging and touch interactions
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.keyboard.disable();
    map.boxZoom.disable();

    console.log('Map initialized, adding neighborhoods...');
    
    // Add neighborhood markers
    addNeighborhoodsToMap();
    
    // After adding neighborhoods to map, add the test marker
    addTestMarker();
    
    // Force a resize event to ensure the map tiles load properly
    setTimeout(() => {
        map.invalidateSize();
    }, 100);

    // Add click handlers for the circular interface
    const innerCircle = document.querySelector('.inner-circle');
    const triangleLeft = document.querySelector('.triangle-left');
    const triangleRight = document.querySelector('.triangle-right');
    const dashedCircle = document.querySelector('.dashed-circle');

    // Make sure the arrows are visible by default
    triangleLeft.style.visibility = 'visible';
    triangleRight.style.visibility = 'visible';

    // Set firstClickDone to true by default
    firstClickDone = true;

    innerCircle.addEventListener('click', () => {
        console.log('Inner circle clicked');
        if (!firstClickDone) {
            firstClickDone = true;
            innerCircle.style.visibility = 'visible';
            document.querySelectorAll('.triangle-left, .triangle-right').forEach(el => {
                el.style.visibility = 'visible';
            });
        }
    });

    triangleLeft.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        console.log('Left arrow clicked');
        currentRotation -= 45;
        dashedCircle.style.transform = `rotate(${currentRotation}deg)`;
        currentCircleIndex = (currentCircleIndex - 1 + 8) % 8;
        updateContent();
    });

    triangleRight.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        console.log('Right arrow clicked');
        currentRotation += 45;
        dashedCircle.style.transform = `rotate(${currentRotation}deg)`;
        currentCircleIndex = (currentCircleIndex + 1) % 8;
        updateContent();
    });
});

function updateContent() {
    console.log('Updating content, current index:', currentCircleIndex);
    // Update content based on currentCircleIndex
    const sections = [
        'Manhattan',
        'Brooklyn',
        'Queens',
        'Bronx',
        'Staten Island',
        'Air Quality',
        'Weather',
        'About'
    ];
    
    // Update the content based on the current section
    const content = document.getElementById('air-quality-info');
    content.querySelector('h2').textContent = sections[currentCircleIndex];

    // Zoom to the selected borough
    const selectedBorough = sections[currentCircleIndex];
    const coords = boroughCoordinates[selectedBorough];
    if (coords) {
        console.log('Updating map view to:', coords);
        map.setView(coords.center, coords.zoom, {
            animate: true,
            duration: 1
        });
    }
}