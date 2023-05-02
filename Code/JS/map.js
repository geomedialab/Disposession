var map = L.map('map', {minZoom: 10, maxBounds:[[45.813049, -74.253832],[45.422965, -73.860249]]}).setView([45.569934, -74.082510], 10);

var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
});

Stadia_AlidadeSmoothDark.addTo(map);

var cadasterStyle = {
    "color": "#ff7800",
    "weight": 0.5,
    "opacity": 1,
};

fetch('../Data/GeoJSON/Full_Cadaster.geojson')
    .then((response) => response.json())
    .then((data) => cadasterData = data)
    .then(() => {
        // Create the popups
        L.geoJSON(
            cadasterData,
            setOptions = {
                style: cadasterStyle,
                onEachFeature: function (feature, layer) {
                    // Capitalize the first word of original deed sale variable
                    const word = feature.properties.ORIGINAL_A
        
                    const capitalized =
                      word.charAt(0)
                      + word.slice(1).toLowerCase()
        
        
                    layer.bindPopup(`<center>
                    <h2>Lot number ${feature.properties.LOT_NUMBER}</h2><br></center>
                    Sold by: ${feature.properties.SOLD_BY}<br>
                    Sold to: ${feature.properties.CONCEDED_T}<br>
                    Date of sale: ${feature.properties.DATE_MM_DD}<br><br>
                    Found original sale: ${capitalized}`);
                }
            }).addTo(map);
        
      });
// var timeline = L.timeline(cadaster.DATE_MM_DD)