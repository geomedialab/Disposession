// Initialize Leaflet map
var zoom = 11;
var center = [45.627687, -74.073016];
var control;

// Variables for timeline
const interval = 900;
const earliestDate = 1760;
const range = 10;

// Initialize map
var map = L.map('map',
    {
        minZoom: 10,
        center: center,
        zoom: zoom,
        zoomControl: false,
        fullScreenControl: false,
    });

// Initialize Basemaps
var darkBasemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

const Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});;

const basemaps = {
    "Carto Dark Basemap": darkBasemap,
    "Esri Satellite Basemap": Esri_WorldImagery
}
var basemapControl = L.control.layers(basemaps).addTo(map);


// Styling parameters
var cadasterColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--cadaster-color');
var purpleColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--purple-color');
var orangeColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--orange-color');
var queryColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--primary-color');

const fullCadasterStyle = {
    "color": cadasterColor,
    "weight": 0.5,
    "opacity": 0.5,
};

const queryStyle = {
    "color": queryColor,
    "fillColor": queryColor,
    "weight": 0.6,
    "opacity": 1,
}

const timelineStyle = {
    "color": cadasterColor,
    "fillColor": cadasterColor,
    "weight": 0.5,
    "opacity": 0.5,
    "fillOpacity": 1
}

const kanehsatakeStyle = {
    "color": purpleColor,
    "weight": 1,
    "opacity": 1,
}

const mergedStyle = {
    "color": purpleColor,
    "fillOpacity": 0.05,
    "weight": 1,
    "opacity": 1,
}


// Adding the layers
function addMerged() {
    fetch('https://spencermartel.github.io/Disposession/data/geojson/mergedCadaster.geojson')
        .then((response) => response.json())
        .then((data) => mergedData = data)
        .then(() => {
            mergedLayer = L.geoJSON(
                mergedData,
                setOptions = {
                    style: mergedStyle,
                }).addTo(map);
        })
}

async function addCadaster() {
    fetch('https://spencermartel.github.io/Disposession/data/geojson/Full_Cadaster.geojson')
        .then((response) => response.json())
        .then((data) => cadasterData = data)
        .then(() => {
            cadasterLegend.addTo(map);
            // Dynamically build selection options for queries
            // This lets the data be "alive" by accepting any new geoJSON after being run through Exploration.ipynb
            createSoldToIndex("buyerQuery")
            createConceededByIndex("conceededByQuery")
            createorigAIndex("originalAQuery")
            // createYearSoldIndex("yearQuery");
            createNumEnregiIndex("numEnregiQuery");


            // Create the popups
            cadasterLayer = L.geoJSON(
                cadasterData,
                setOptions = {
                    style: fullCadasterStyle,
                    onEachFeature: onEachFeature
                }).addTo(map);
        });
}

function addKanehsatake() {
    fetch('https://spencermartel.github.io/Disposession/data/geojson/kanehsatake.geojson')
        .then((response) => response.json())
        .then((r) => kanehsatakeData = r)
        .then(() => {
            kanehsatakeLayer = L.geoJSON(
                kanehsatakeData,
                setStyle = {
                    style: kanehsatakeStyle
                }
            ).addTo(map);
        });
}


// Georeferencing check for where to place marker if it's within the polygon
function pointInPoly(marker) {
    const latLng = marker.getLatLng();
    var numberOfLots = 0
    cadasterLayer.eachLayer(function (indivLot) {
        if (indivLot.contains(latLng)) {
            displayQueryResults(indivLot.feature)
            numberOfLots += 1
            marker.addTo(map);
        }
    })
    if (numberOfLots == 0) {
        document.getElementById("not-in-polygon").style.display = "block";
    } else {
        document.getElementById("not-in-polygon").style.display = "none";
    }
}

const cadasterLegend = L.control({ position: 'topleft' });
cadasterLegend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    labels = [],
        categories = [{ name: 'Historic White settlement', color: cadasterColor }, { name: 'Kanehsatà:ke Today', color: purpleColor }];
    // Seignerie du Lac des Deux Montagnes
    for (var i = 0; i < categories.length; i++) {

        div.innerHTML +=
            labels.push(
                '<i class="circle" style="background:' + categories[i].color + '"></i> ' +
                (categories[i].name));

    }
    div.innerHTML = labels.join('<br>');
    return div;
};

// Meat and potatoes of the timeline function
function timeDisplay(data, previousYear, liveYear) {

    // Remove top right eyar range if it exists
    var elements = document.getElementsByClassName('info legend year-legend leaflet-control');
    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }

    // Create and add Years to top right
    var yearLegend = L.control({ position: 'topright' });
    yearLegend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend year-legend');

        div.innerHTML = '' + previousYear + ' - ' + liveYear
        return div
    }
    yearLegend.addTo(map);

    // Check conditions, add to array
    for (var i = 0; i < data.features.length; i++) {
        const correctArray = [];
        const featureTime = data.features[i].properties.year;

        // Correct time check
        if ((featureTime > previousYear) && (featureTime <= (previousYear + range))) {
            // Don't include only part of the sale lot (inclusion by Lea May 15th)
            // These lots more or less line up with Kanehsatake today
            if (data.features[i].properties.ORIGINAL_A != "Only part of the lot") {
                correctArray.push(data.features[i])
            }
        }
        // show layer with array of correct conditions 
        timelineLayer = L.geoJSON(
            correctArray,
            setOptions = {
                style: fullCadasterStyle,
                onEachFeature: onEachFeature
            }).addTo(map);
    }

    // Recursive call 
    if (liveYear <= 1960) {
        setTimeout(() => { timeDisplay(data, liveYear, (liveYear + range)); }, interval);
    } else {
        // The timeline is over, reset the map

        document.getElementsByClassName("info legend leaflet-control")[0].style.display = 'block';
        document.getElementsByClassName('info legend year-legend leaflet-control')[0].style.display = 'none';
        document.getElementsByClassName("leaflet-bottom")[0].style.display = 'block';
        basemapControl.addTo(map);

        // Set map state to base form
        resetLayers();

        map.addLayer(kanehsatakeLayer);
        map.addLayer(cadasterLayer);

        console.log('Timeline Completed')
    }
}

function resetLayers() {
    map.eachLayer(function (layer) {
        if (layer != darkBasemap) {
            if (layer != Esri_WorldImagery) {
                map.removeLayer(layer);
            }
        }
    });
}

function startTimeDisplay() {
    map.fitBounds(cadasterLayer.getBounds());
    resetLayers();

    document.getElementsByClassName("leaflet-bottom")[0].style.display = 'none';
    basemapControl.remove(map);
    addMerged();

    fetch('https://spencermartel.github.io/Disposession/data/geojson/Full_Cadaster.geojson')
        .then((response) => response.json())
        .then((data) => cadasterData = data)
        .then(() => setTimeout(() => { timeDisplay(cadasterData, earliestDate, (earliestDate + range)); }, 800));
}


function resetMap() {
    resetLayers();
    resetInputs();
    resetUls();
    addKanehsatake();
    addCadaster();

    document.getElementById("no-data").style.display = "none";
    document.getElementById("no-address").style.display = "none";
    document.getElementById("not-in-polygon").style.display = "none";

    document.getElementById("omit-year-query").checked = true;
    document.getElementById("greyed-out").style.zIndex = 9999;

    document.getElementsByClassName("info legend leaflet-control")[0].style.display = 'block';
    map.fitBounds(cadasterLayer.getBounds());
}

function displayQueryResults(queryResults) {
    resetLayers();

    queryLayer = L.geoJSON(
        queryResults,
        setOptions = {
            style: queryStyle,
            onEachFeature: onEachFeature
        });
    map.removeLayer(cadasterLayer);
    map.removeLayer(kanehsatakeLayer);
    map.addLayer(queryLayer);
    map.fitBounds(queryLayer.getBounds());
}

// Build popup and tooltips
var onEachFeature = function (feature, layer) {
    // Capitalize the first word of original deed sale variable
    const word = feature.properties.ORIGINAL_A
    const capitalized =
        word.charAt(0)
        + word.slice(1).toLowerCase()

    // if (feature.properties.)

    if (feature.properties.CONCEDED_T != null) {
        var wayOfSale = 'Conceded'
        var soldOrConceeded = `${wayOfSale} by: ${feature.properties.CONCEDED_B}
                               <br>${wayOfSale} to: ${feature.properties.CONCEDED_T}`
    } else {
        var wayOfSale = 'Sold'
        var soldOrConceeded = `${wayOfSale} by: ${feature.properties.SOLD_BY}
                               <br>${wayOfSale} to: ${feature.properties.SOLD_TO}`
    }
    if (feature.properties.NOTES != null && feature.properties.NOTES.includes('part')) {
        var partOfLotString = 'Part of Lot number'
    }
    else {
        var partOfLotString = 'Lot number'
    }


    layer.bindPopup(
        `<center><h2>${partOfLotString} ${feature.properties.LOT_NUMBER}</h2><h3></center>` +

        // Correct order
        `<br>First ${wayOfSale} on: ${feature.properties.DATE_MM_DD}<br>${soldOrConceeded}<br>Lot size: ${(feature.properties.Area_new_1 / 247.105).toFixed(2)} acres<br></b><br>` +

        '<i>Information from the Land Registry of Quebec.</i><br>' +

        `Lot registration number: ${feature.properties.NUM_ENREGI}
                     <br>Found original sale: ${capitalized}
                     <br>Notes: ${feature.properties.NOTES}`,
        // Styling tooltip Options
        {
            sticky: false,
            opacity: 0.8,
            closeButton: true
        }
    );
    layer.bindTooltip(`
     <center>
     <h2>${partOfLotString} ${feature.properties.LOT_NUMBER}</h2>
     </center>`);
}

// Change styling based on zoom (essentially like breakpoints)
map.on("zoomend", checkAndChangeStylingParameters);
map.on("baselayerchange", checkAndChangeStylingParameters);

function checkAndChangeStylingParameters() {
    var zoomLevel = map.getZoom();
    if (map.hasLayer(Esri_WorldImagery) && map.hasLayer(cadasterLayer)) {
        console.log('World imagery basemap selected');
        console.log("Cadaster layer present")
        if (zoomLevel == 12) {
            console.log("Changing styling params")
            cadasterLayer.setStyle(
                {
                    "weight": 1.5
                }
            )

        } if (zoomLevel > 12) {
            console.log("Changing styling params")
            cadasterLayer.setStyle(
                {
                    "weight": 2
                }
            )

        } else {
            cadasterLayer.setStyle(
                {
                    "weight": 0.5
                }
            )

        }
        // Reset them
    } else {
        cadasterLayer.setStyle(
            {
                "weight": 0.5
            }
        )

    }
}

addKanehsatake();
addCadaster();