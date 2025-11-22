const map = L.map('map').setView([39.8283, -98.5795], 4); // CONUS centered
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
attribution: 'US Military Base Monitoring System'
}).addTo(map);

let lastQuakeTime = 0;

function fetchQuakes() {
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.0_hour.geojson')
.then(r => r.json())
.then(data => {
map.eachLayer(l => { if (l.options && l.options.type === 'quake') map.removeLayer(l); });

let threatDetected = false;
const minMag = document.getElementById('magFilter').value;

data.features.forEach(q => {
if (q.properties.mag >= minMag) {
threatDetected = true;
const coords = [q.geometry.coordinates[1], q.geometry.coordinates[0]];
L.circleMarker(coords, {
radius: q.properties.mag * 3,
color: '#ff0044',
weight: 3,
fillOpacity: 0.7,
type: 'quake'
}).addTo(map)
.bindPopup(`<b>M${q.properties.mag}</b> ${q.properties.place}<br>${new Date(q.properties.time).toLocaleString()}`);
}
});

document.getElementById('status-text').textContent = threatDetected ? 'THREAT DETECTED' : 'ALL CLEAR';
document.getElementById('status-text').className = threatDetected ? 'red' : 'green';
document.getElementById('magValue').textContent = minMag;
});
}

document.getElementById('magFilter').addEventListener('input', e => {
document.getElementById('magValue').textContent = e.target.value;
fetchQuakes();
});

fetchQuakes();
setInterval(fetchQuakes, 60000); // every minute
