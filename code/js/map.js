// Get better zoom on maps based on window size
const height = window.innerHeight
const width = window.innerWidth

if (height < 900) {
    var zoom = 10
    var center = [45.631550, -73.509463];
} else {
    var zoom = 10.5;
    if (width > 1500) {
        var center = [45.631550, -73.759463];
    }
    else {
        var center = [45.631550, -73.839463];
    }
}


// Variables for timeline
const interval = 1800;
const earliestDate = 1770;
const range = 10;
// Used to cancel timeline animation if Reset Map is pressed, eventually gets populated with setTimeout ID
var timer = null;

function scrollToTop() {
    main = document.querySelector("main")
    main.scrollTo(0, 0);
}


function scrollToBottom() {
    main = document.querySelector("main")
    main.scrollTo(0, 100000);
}


function viewFullMap() {
    scrollToTop();
    var introBox = document.querySelector("#intro-box")
    var queryBox = document.querySelector("#query-box");

    state = document.querySelector("#view-full-map");

    // Show Query Map
    if (state.innerHTML == "VIEW FULL MAP") {
        resetTimeline();
        timelineMap.flyTo(center, zoom);
        addCadasterToTimeline();
        addKanehsatakeToTimeline();

        introBox.style.opacity = 0;
        queryBox.style.opacity = 100;

        introBox.style.display = 'none';
        queryBox.style.display = 'block';
        state.innerHTML = "VIEW TIMELINE"
        turnOnMapInteraction(timelineMap, "timeline-map")

        // Show Timeline
    } else if (state.innerHTML == "VIEW TIMELINE") {
        startTimeDisplay();

        introBox.style.opacity = 100;
        queryBox.style.opacity = 0;
        introBox.style.display = 'block';
        queryBox.style.display = 'none';
        introBox.style.display = 'block';

        timelineMap.flyTo([45.631550, -73.709463], 10.5);
        state.innerHTML = "VIEW FULL MAP"
        turnOffMapInteraction(timelineMap, "timeline-map")
    }
    resetTimeline();
    resetLayersTimeline();

}
// Initialize maps

var timelineMap = L.map('timeline-map',
    {
        center: center,
        zoom: zoom,
        zoomControl: false,
        fullScreenControl: false,
        attributionControl: false
    });

var geocoding_map = L.map('geocoding-map',
    {
        zoom: 10,
        center: [45.631550, -74.009463],
        zoomControl: false,
        fullScreenControl: false,
    });

// Layer control must reference different layers see #3 : https://store.extension.iastate.edu/product/15632.pdf
// Layer control is actually created and added in the addIndigLands function

const Esri_WorldImagery1 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(timelineMap);

const Esri_WorldImagery2 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(geocoding_map);

var darkBasemap1 = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
    zIndex: 10,
}).addTo(timelineMap);

var darkBasemap2 = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(geocoding_map);



// This is a convoluted function that adds IndigLandsLayer to the basemaps but is also in charge of creating the basemap control features
// It's not great coding but it works
function addIndigLands() {
    fetch("https://spencermartel.github.io/Disposession/data/geojson/Indig_lands_clipped.geojson")
        .then((response) => response.json())
        .then((r) => indigLandsData = r)
        .then(() => {
            var indigLandsLayer = L.geoJSON(
                indigLandsData,
                setOptions = {
                    onEachFeature: onEachFeatureIndigLands,
                }
            );
            // The order within these determines which is initalized on top.
            // The lower one gets rendered as on top of the other ones so is the first layer the user will see.
            const basemaps1 = {
                "Satellite Basemap": Esri_WorldImagery1,
                "Dark Basemap": darkBasemap1,
            }
            const overlays1 = {
                "North American Indigenous Lands<br>&emsp;&nbsp;sourced from Native-Land.ca": indigLandsLayer
            }

            const basemaps2 = {
                "Satellite Basemap": Esri_WorldImagery2,
                "Dark Basemap": darkBasemap2,
            }
            const overlays2 = {
                "North American Indigenous Lands<br>&emsp;&nbsp;sourced from Native-Land.ca": indigLandsLayer
            }

            L.control.layers(basemaps1, overlays1, { position: 'topleft' }).addTo(timelineMap);
            L.control.layers(basemaps2, overlays2, { position: 'topleft' }).addTo(geocoding_map);

        });
}


// Styling parameters
var cadasterColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--cadaster-color');
var purpleColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--purple-color');
var orangeColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--orange-color');
var queryColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--primary-color');
var blackColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--black-color');

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

var timelineStyle = {
    "color": getComputedStyle(document.documentElement)
        .getPropertyValue('--white-color'),
    "weight": 1,
    "opacity": 0,
    "fillOpacity": 0
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

function addCadaster(map) {
    fetch('https://spencermartel.github.io/Disposession/data/geojson/Full_Cadaster.geojson')
        .then((response) => response.json())
        .then((data) => cadasterData = data)
        .then(() => {
            // Dynamically build selection options for queries
            // This lets the data be "alive" by accepting any new geoJSON after being run through Exploration.ipynb
            createSoldToIndex("buyerQuery")
            createConceededByIndex("conceededByQuery")
            createorigAIndex("originalAQuery")
            createNumEnregiIndex("numEnregiQuery");


            // Create the popups
            cadasterLayer = L.geoJSON(
                cadasterData,
                setOptions = {
                    style: fullCadasterStyle,
                    onEachFeature: onEachFeatureCadaster,
                }
            ).addTo(map);
        });
}

function addCadasterToTimeline() {
    fetch('https://spencermartel.github.io/Disposession/data/geojson/Full_Cadaster.geojson')
        .then((response) => response.json())
        .then((data) => cadasterData = data)
        .then(() => {
            // Dynamically build selection options for queries
            // This lets the data be "alive" by accepting any new geoJSON after being run through Exploration.ipynb
            createSoldToIndex("buyerQuery")
            createConceededByIndex("conceededByQuery")
            createorigAIndex("originalAQuery")
            createNumEnregiIndex("numEnregiQuery");

            // Create the popups
            cadasterLayer = L.geoJSON(
                cadasterData,
                setOptions = {
                    style: fullCadasterStyle,
                    onEachFeature: onEachFeatureCadaster,
                }
            ).addTo(timelineMap);
        });
}


function addKanehsatakeToMain() {
    fetch('https://spencermartel.github.io/Disposession/data/geojson/kanehsatake.geojson')
        .then((response) => response.json())
        .then((r) => kanehsatakeData = r)
        .then(() => {
            kanehsatakeLayer = L.geoJSON(
                kanehsatakeData,
                setStyle = {
                    style: kanehsatakeStyle
                }
            ).addTo(geocoding_map);
        });
}

function addKanehsatakeToTimeline() {
    fetch('https://spencermartel.github.io/Disposession/data/geojson/kanehsatake.geojson')
        .then((response) => response.json())
        .then((r) => kanehsatakeData = r)
        .then(() => {
            kanehsatakeLayer = L.geoJSON(
                kanehsatakeData,
                setStyle = {
                    style: kanehsatakeStyle
                }
            ).addTo(timelineMap);
        });
}

// Georeferencing check for where to place marker if it's within the polygon
function pointInPoly(marker) {
    const latLng = marker.getLatLng();
    var numberOfLots = 0
    resetLayersGeocoding();
    cadasterLayer.eachLayer(function (indivLot) {
        if (indivLot.contains(latLng)) {

            displayQueryResults(indivLot.feature, geocoding_map)
            numberOfLots += 1
            marker.addTo(geocoding_map);
            scrollToBottom();
        }
    })
    if (numberOfLots == 0) {
        document.getElementById("not-in-polygon").style.display = "block";
    } else {
        document.getElementById("not-in-polygon").style.display = "none";
    }
}

// Top left legend details
// const cadasterLegend = L.control({ position: 'topright' });
// cadasterLegend.onAdd = function () {
//     const div = L.DomUtil.create('div');
//     labels = [],
//         categories = [
//             { name: '<div class="english">Historic white settlement</div><div class="french">French text</div>', color: cadasterColor },
//             { name: '<div class="english">Kanehsatà:ke today</div><div class="french">French text</div>', color: purpleColor },
//         ];
//     // Seignerie du Lac des Deux Montagnes
//     for (var i = 0; i < categories.length; i++) {
//         div.innerHTML +=
//             labels.push(
//                 '<i class="circle" style="background:' + categories[i].color + '"></i>' +
//                 (categories[i].name));
//     }
//     div.innerHTML = labels.join("");
//     return div;
// }

//Function to create gradient color array given start colow, end color, and # of steps
function gradient(startColor, endColor, steps) {
    var start = {
        'Hex': startColor,
        'R': parseInt(startColor.slice(1, 3), 16),
        'G': parseInt(startColor.slice(3, 5), 16),
        'B': parseInt(startColor.slice(5, 7), 16)
    }
    var end = {
        'Hex': endColor,
        'R': parseInt(endColor.slice(1, 3), 16),
        'G': parseInt(endColor.slice(3, 5), 16),
        'B': parseInt(endColor.slice(5, 7), 16)
    }
    diffR = end['R'] - start['R'];
    diffG = end['G'] - start['G'];
    diffB = end['B'] - start['B'];

    stepsHex = new Array();
    stepsR = new Array();
    stepsG = new Array();
    stepsB = new Array();

    for (var i = 0; i <= steps; i++) {
        stepsR[i] = start['R'] + ((diffR / steps) * i);
        stepsG[i] = start['G'] + ((diffG / steps) * i);
        stepsB[i] = start['B'] + ((diffB / steps) * i);
        stepsHex[i] = '#' + Math.round(stepsR[i]).toString(16) + '' + Math.round(stepsG[i]).toString(16) + '' + Math.round(stepsB[i]).toString(16);
    }
    return stepsHex;

}

var timelineGradient = gradient('#171717', '#FFFFFF', 19)


// Meat and potatoes of the timeline function
function timeDisplay(data, previousYear, liveYear, index) {

    // Remove bottom left year range if it exists
    var elements = document.getElementsByClassName('year-legend');
    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
    // Create and add Years to top right
    var yearLegend = L.control({ position: 'bottomleft' });
    yearLegend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend year-legend');

        div.innerHTML = '' + previousYear + ' - ' + liveYear
        return div
    }
    yearLegend.addTo(timelineMap);


    // Check conditions, add to array
    const correctArray = [];
    for (var i = 0; i < data.features.length; i++) {
        const featureTime = data.features[i].properties.year;

        // Correct time check
        if ((featureTime > previousYear) && (featureTime <= (previousYear + range))) {
            // Don't include only part of the sale lot (inclusion by Lea May 15th)
            // These lots more or less line up with Kanehsatake today
            if (data.features[i].properties.ORIGINAL_A != "Only part of the lot") {
                correctArray.push(data.features[i])
            }
        }
    }

    var timelineStyle = {

        "fillColor": timelineGradient[index],
        "fillOpacity": 0,

        "color": "#000",
        "weight": 1,
        "opacity": 0,

        "interactive": false,
    }

    // Define layer with correct array as data
    timelineLayer = L.geoJSON(
        correctArray,
        timelineStyle
    ).addTo(timelineMap);
    // Fade that layer onto map over time
    fadeInLayerLeaflet(timelineLayer, timelineStyle.opacity, 0.8, 0.01, interval / 100)
    // Recursive call 
    if (liveYear <= 1960) {
        timer = setTimeout(() => { timeDisplay(data, liveYear, (liveYear + range), (index + 1)); }, interval);
    } else {
        // Create and add Years to top right
        var yearLegend = L.control({ position: 'bottomleft' });
        yearLegend.onAdd = function () {
            const div = L.DomUtil.create('div', 'info legend year-legend');

            div.innerHTML = 'Hello'
            return div
        }
        resetLayersTimeline();
        setInterval(startTimeDisplay(), 2000);
    }
}


// Shout out this guy: https://codepen.io/maptastik/pen/MZprRJ
function fadeInLayerLeaflet(lyr, startOpacity, finalOpacity, opacityStep, delay) {
    let opacity = startOpacity;
    let timer = setTimeout(function changeOpacity() {
        if (opacity < finalOpacity) {
            lyr.setStyle({
                fillOpacity: opacity,
                opacity: opacity
            });
            opacity = opacity + opacityStep
        }

        timer = setTimeout(changeOpacity, delay);
    }, delay)
}

function resetLayersTimeline() {
    timelineMap.eachLayer(function (layer) {
        if (layer != darkBasemap1) {
            if (layer != Esri_WorldImagery1) {
                timelineMap.removeLayer(layer);
            }
        }
    });
}

function resetLayersGeocoding() {
    geocoding_map.eachLayer(function (layer) {
        if (layer != darkBasemap2) {
            if (layer != Esri_WorldImagery2) {
                geocoding_map.removeLayer(layer);
            }
        }
    });
}

function startTimeDisplay() {
    fetch('https://spencermartel.github.io/Disposession/data/geojson/Full_Cadaster.geojson')
        .then((response) => response.json())
        .then((data) => cadasterData = data)
        .then(() => {
            // Start the timeline animation
            timeDisplay(cadasterData, earliestDate, (earliestDate + range), 0);

            // If Reset Map is clicked during animation, end timeout
            document.getElementById("reset-map").addEventListener("click", function () {
                resetTimeline();
            });
        }
        );
}

function resetTimeline() {
    clearTimeout(timer);
    var elements = document.getElementsByClassName("year-legend")
    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
}


function resetMap() {
    // Remove stuff
    resetLayersTimeline();
    resetInputs();
    turnOnMapInteraction(timelineMap, "timeline-map");
    // Re-add stuff
    timelineMap.addLayer(kanehsatakeLayer);
    timelineMap.addLayer(cadasterLayer);

    document.getElementById("no-data").style.display = "none";
    // document.getElementById("no-address").style.display = "none";
    // document.getElementById("not-in-polygon").style.display = "none";

    document.getElementById("omit-year-query").checked = true;
    document.getElementById("greyed-out").style.zIndex = 9999;

    document.getElementsByClassName("leaflet-top leaflet-left")[0].style.display = 'block';
    document.getElementsByClassName("leaflet-top leaflet-right")[0].style.display = 'block';
    document.getElementsByClassName("leaflet-control-layers leaflet-control")[0].style.display = 'block';

    scrollToTop();
    timelineMap.fitBounds(cadasterLayer.getBounds())
}

function displayQueryResults(queryResults, map) {
    // Remove General Legend
    // document.getElementsByClassName("leaflet-top leaflet-left")[0].style.display = 'none';
    document.getElementById("no-data").style.display = "none";
    if (map == timelineMap) {
        resetLayersTimeline();
        resetTimeline();
    }

    queryLayer = L.geoJSON(
        queryResults,
        setOptions = {
            style: queryStyle,
            onEachFeature: onEachFeature
        });

    ghostLayer = L.geoJSON(
        cadasterData,
        setOptions = {
            style: {
                fillColor: '#1f1f1e',
                weight: 0.1,
                color: '#575654',
                // opacity: 0.3,
                fillOpacity: 0.3
            }
        }
    )

    map.addLayer(ghostLayer);
    map.addLayer(queryLayer);

    // Center slightly to the right of cadaster to account for intro/query box
    map.flyToBounds(queryLayer.getBounds(), { duration: 1.5 });
}

// Build popup and tooltips
var onEachFeature = function (feature, layer) {
    // Capitalize the first word of original deed sale variable
    const word = feature.properties.ORIGINAL_A
    const capitalized =
        word.charAt(0)
        + word.slice(1).toLowerCase()


    if (feature.properties.CONCEDED_T != null) {
        var wayOfSale = 'Conceded'
        var soldOrConceeded = `<br>By: ${feature.properties.CONCEDED_B}
                                 <br>To: ${feature.properties.CONCEDED_T}`
    } else {
        var wayOfSale = 'Sold'
        var soldOrConceeded = `<br>By ${feature.properties.SOLD_BY}
                                <br>To: ${feature.properties.SOLD_TO}`
    }
    if (feature.properties.NOTES != null && feature.properties.NOTES.includes('part')) {
        var partOfLotString = 'Part of lot number'
    }
    else {
        var partOfLotString = 'Lot number'
    }


    layer.bindPopup(
        `<center><h2>${partOfLotString} ${feature.properties.LOT_NUMBER}</h2><h3></center>` +

        // Correct order
        `<br>First ${wayOfSale} on ${feature.properties.DATE_MM_DD}${soldOrConceeded}.<br>Lot size of ${(feature.properties.Area_new_1 / 40.469).toFixed(2)} acres<br></b><br>` +

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

// Build popup and tooltips specific to Cadaster layer
var onEachFeatureCadaster = function (feature, layer) {
    // Capitalize the first word of original deed sale variable
    const word = feature.properties.ORIGINAL_A
    const capitalized =
        word.charAt(0)
        + word.slice(1).toLowerCase()

    layer.on('mouseover', function () {
        this.setStyle({
            'fillColor': queryColor,
            'color': queryColor,
        });
    });
    layer.on('mouseout', function () {
        this.setStyle({
            'fillColor': cadasterColor,
            'color': cadasterColor,
        });
    });

    if (feature.properties.CONCEDED_T != null) {
        var wayOfSale = 'Conceded'
        var soldOrConceeded = `<div class="english"><br>By: ${feature.properties.CONCEDED_B}
                                 <br>To: ${feature.properties.CONCEDED_T}</div>`
    } else {
        var wayOfSale = 'Sold'
        var soldOrConceeded = `<div class="english"><br>By ${feature.properties.SOLD_BY}
                                <br>To: ${feature.properties.SOLD_TO}</div>`
    }
    if (feature.properties.NOTES != null && feature.properties.NOTES.includes('part')) {
        var partOfLotString = 'Part of lot number'
    }
    else {
        var partOfLotString = 'Lot number'
    }


    layer.bindPopup(
        `<center><h2>${partOfLotString} ${feature.properties.LOT_NUMBER}</h2><h3></center>` +

        // Correct order
        `<br>First ${wayOfSale} on ${feature.properties.DATE_MM_DD}${soldOrConceeded}<br>Lot size of ${(feature.properties.Area_new_1 / 40.469).toFixed(2)} acres<br></b><br>` +

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


var onEachFeatureIndigLands = function (feature, layer) {
    layer.setStyle({
        "color": feature.properties.color,
        "fillOpacity": 0,
        "weight": 0,
        "opacity": 0.5,
        'dashArray': '5'
    })

    // Trying to add labels to markers to show indig names on map, REALLY affects performance
    // var bounds = layer.getBounds();
    // var latLng = bounds.getCenter();
    // var marker = new L.marker([latLng.lat, latLng.lng], { opacity: 0})
    // marker.bindTooltip(feature.properties.Name, { permanent: true, direction: "center", className: "IndigLandLabel", offset: [0, 0] });
    // marker.addTo(map);

    // Hover Tooltiups are much less demanding computationally
    layer.bindTooltip(`
    <center>
    <h2>${feature.properties.Name}</h2>
    </center>`,
        {
            sticky: true,
            opacity: 0.8,
            closeButton: true
        });


}

// Change styling based on zoom (essentially like breakpoints)
// timelineMap.on("zoomend", checkAndChangeStylingParameters());
// timelineMap.on("baselayerchange", checkAndChangeStylingParameters());

function checkAndChangeStylingParameters() {
    var zoomLevel = map.getZoom();

    if (timelineMap.hasLayer(cadasterLayer)) {
        if (zoomLevel <= 7) {
            cadasterLayer.setStyle(
                {
                    "weight": 0
                }
            )
        }
    }
    if (geocoding_map.hasLayer(cadasterLayer)) {
        if (zoomLevel <= 7) {
            cadasterLayer.setStyle(
                {
                    "weight": 0
                }
            )
        }
    }
    if (timelineMap.hasLayer(Esri_WorldImagery) && timelineMap.hasLayer(cadasterLayer)) {
        if (zoomLevel == 12) {
            cadasterLayer.setStyle(
                {
                    "weight": 1.5
                }
            )

        } if (zoomLevel > 12) {
            cadasterLayer.setStyle(
                {
                    "weight": 5
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

    } if (geoco.hasLayer(Esri_WorldImagery) && timelineMap.hasLayer(cadasterLayer)) {
        if (zoomLevel == 12) {
            cadasterLayer.setStyle(
                {
                    "weight": 1.5
                }
            )

        } if (zoomLevel > 12) {
            cadasterLayer.setStyle(
                {
                    "weight": 5
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

function turnOffMapInteraction(map, mapid) {
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    if (map.tap) map.tap.disable();
    document.getElementById(mapid).style.cursor = 'default';
}
function turnOnMapInteraction(map, mapid) {
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
    if (map.tap) map.tap.enable();
    document.getElementById(mapid).style.cursor = 'grab';
}

turnOffMapInteraction(timelineMap, "timeline-map")
// Initialize the map with data, The order added affects which is on top of the other
addIndigLands();
addKanehsatakeToMain();
addCadaster(geocoding_map);
var markerGroup = L.layerGroup().addTo(geocoding_map);
$(document).ready(function () { startTimeDisplay(); })