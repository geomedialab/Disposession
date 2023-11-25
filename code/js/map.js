
var zoom = 9
var center = [45.631550, -73.509463];


// Variables for timeline
const interval = 1400;
const earliestDate = 1770;
const range = 10;
// Used to cancel timeline animation if Reset Map is pressed, eventually gets populated with setTimeout ID
var timer = null;

function viewFullMap() {
    scrollToTop();
    var introBox = document.querySelector("#intro-box");
    var queryBox = document.querySelector("#query-box");

    // Turn on/off legend and zoom things
    var zoomControl = document.querySelector(".leaflet-control-zoom.leaflet-bar.leaflet-control");
    var baselayerControl = document.querySelector(".leaflet-control-layers");

    var state = document.querySelector("#state");
    var state2 = document.querySelector("#state2");

    var language = checkCookie();
    function setUpQueryMap() {
        resetTimeline();
        timelineMap.flyToBounds(cadasterLayer, { paddingBottomRight: [500, 0] });
        addCadasterToTimeline();
        addKanehsatakeToTimeline();
        zoomControl.style.display = "block";
        baselayerControl.style.clear = "none";

        introBox.style.opacity = 0;
        queryBox.style.opacity = 100;

        introBox.style.display = 'none';
        queryBox.style.display = 'block';
        turnOnMapInteraction(timelineMap, "timeline-map")
    }

    if (language == "french") {
        if (state2.innerHTML == "LA CARTE") {
            setUpQueryMap();
            state2.innerHTML = "LA CHRONOLOGIE";
        } else {
            startTimeDisplay();

            introBox.style.opacity = 100;
            queryBox.style.opacity = 0;
            introBox.style.display = "block";
            queryBox.style.display = "none";

            timelineMap.flyTo([45.631550, -73.709463], 10.5);
            state2.innerHTML = "LA CARTE";
            turnOffMapInteraction(timelineMap, "timeline-map")
        }
    } else {
        // Show Query Map
        if (state.innerHTML == "VIEW FULL MAP") {
            setUpQueryMap();
            state.innerHTML = "VIEW TIMELINE"
            // Show Timeline
        } else {
            startTimeDisplay();

            introBox.style.opacity = 100;
            queryBox.style.opacity = 0;
            introBox.style.display = "block";
            queryBox.style.display = "none";

            timelineMap.flyTo([45.631550, -73.709463], 10.5);
            state.innerHTML = "VIEW FULL MAP"
            turnOffMapInteraction(timelineMap, "timeline-map")
        }
        resetTimeline();
        resetLayersTimeline();

    }
}

var timelineMap = L.map('timeline-map',
    {
        center: center,
        zoom: zoom,
        zoomControl: false,
        fullScreenControl: false,
        attributionControl: false
    });
timelineMap.scrollWheelZoom.disable();
L.control.zoom({
    position: 'topleft'
}).addTo(timelineMap)

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
    fetch("https://native-land.ca/wp-json/nativeland/v1/api/index.php?maps=territories&name=mohawk")
        .then((response) => response.json())
        .then((r) => indigLandsData = r)
        .then(() => {
            var indigLandsLayer = L.geoJSON(
                indigLandsData,
                setOptions = {
                    onEachFeature: onEachFeatureIndigLands,
                    attribution: "Native Land Digital"
                }
            );
            // The order within these determines which is initalized on top.
            // The lower one gets rendered as on top of the other ones so is the first layer the user will see.
            const basemaps1 = {
                "Satellite Basemap": Esri_WorldImagery1,
                "Dark Basemap": darkBasemap1,
            }
            const overlays1 = {
                "Mohawk Indigenous Lands<br>&emsp;&nbsp;sourced from <a href='https://native-land.ca/' target='_blank'>Native-Land.ca</a>": indigLandsLayer
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

const invisibleCadasterStyle = {
    "weight": 0,
    "opacity": 0,
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

// Only used to flyToBounds of cadaster layer on initial load so center and zoom of map are screen size appropriate
function addInvisibleCadaster(map) {
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
            var invisibleCadasterLayer = L.geoJSON(
                cadasterData,
                setOptions = {
                    style: invisibleCadasterStyle,
                    onEachFeature: onEachFeatureCadaster,
                }
            ).addTo(map);

            timelineMap.flyToBounds(invisibleCadasterLayer, { paddingBottomRight: [700, 0] })
            timelineMap.removeLayer(invisibleCadasterLayer);
            delete cadasterData;
            delete invisibleCadasterLayer;
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
                    "fillColor": purpleColor,
                    "color": blackColor,
                    "weight": 1,
                    "opacity": 0,
                    "fillOpacity": 0,
                }
            ).addTo(timelineMap);

            fadeInLayerLeaflet(kanehsatakeLayer, 0, 0.5, 0.01, interval / 100);
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
const cadasterLegend = L.control({ position: 'bottomleft' });
cadasterLegend.onAdd = function () {
    var div = L.DomUtil.create('div', 'info legend');
    div.id = "timeline-legend"
    div.style.backgroundColor = "transparent";
    div.style.color = cadasterColor;
    div.style.whitespace = "nowrap";
    labels = [],
        categories = [
            '<i class="gradient-line" style="background-image: linear-gradient(to right, #1c1c1c, #FFFFFF);"></i>' + '<div class="english machina">Mohawk Land granted to settlers</div><div class="french machina">La terre des Mohawks accordée aux colons</div>',
            '<i style="background:' + purpleColor + '"></i>' + '<div class="english machina">Kanehsatà:ke today</div><div class="french machina">Kanehsatà:ke aujourd\'hui</div>',
        ];

    for (var i = 0; i < categories.length; i++) {
        div.innerHTML +=
            labels.push(categories[i])
    }
    div.innerHTML = labels.join("");
    return div;
}

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

const linearStartStop = ['#1c1c1c', '#FFFFFF']

var timelineGradient = gradient(linearStartStop[0], linearStartStop[1], 19)


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
        div.id = "year-legend"

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
        // Remove bottom left year range if it exists
        var elements = document.querySelector('year-legend');
        addKanehsatakeToTimeline();
        setTimeout(startTimeDisplay, 7000);
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
            resetLayersTimeline();
            cadasterLegend.addTo(timelineMap);

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
    var elements = document.getElementById("year-legend")
    elements.style.display = "none"
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
    timelineMap.fitBounds(cadasterLayer.getBounds(), { paddingBottomRight: [400, 0] })
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
                fillOpacity: 0.3
            }
        }
    )

    map.addLayer(ghostLayer);
    map.addLayer(queryLayer);
    ghostLayer.bringToFront();
    queryLayer.bringToFront();

    // Center slightly to the right of cadaster to account for intro/query box
    map.flyToBounds(queryLayer.getBounds(), { duration: 1.5 });
}

// Build popup and tooltips
var onEachFeature = function (feature, layer) {
    // Capitalize the first word of original deed sale variable
    const word = feature.properties.ORIGINAL_A
    const capitalized = word.charAt(0) + word.slice(1).toLowerCase()

    if (feature.properties.CONCEDED_T != null) {
        var wayOfSale = '<p class="english">Conceded</p><p class="french">Concédé</p>'
        var soldOrConceeded = `<div class="english"><br>By: ${feature.properties.CONCEDED_B}
                                 <br>To: ${feature.properties.CONCEDED_T}</div>\
                                 <div class="french"> Par: ${feature.properties.CONCEDED_B}
                                 <br>À: ${feature.properties.CONCEDED_T}</div>`
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
        // English popup
        `<p class="english"><center><h2>${partOfLotString} ${feature.properties.LOT_NUMBER}</h2><h3></center>` +

        // Correct order
        `<br>First ${wayOfSale} on ${feature.properties.DATE_MM_DD}${soldOrConceeded}<br>Lot size of ${(feature.properties.Area_new_1 / 40.469).toFixed(2)} acres<br></b><br>` +

        '<i>Information from the Land Registry of Quebec.</i><br>' +

        `Lot registration number: ${feature.properties.NUM_ENREGI}
                     <br>Found original sale: ${capitalized}
                     <br>Notes: ${feature.properties.NOTES}
                     </p>`,
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
        "color": purpleColor,
        "fillOpacity": 0.02,
        "weight": 2,
        "fillColor": purpleColor,
        "opacity": 1,
        'dashArray': '5',
    })

    // Trying to add labels to markers to show indig names on map, REALLY affects performance
    // var bounds = layer.getBounds();
    // var latLng = bounds.getCenter();
    // var marker = new L.marker([latLng.lat, latLng.lng], { opacity: 0})
    // marker.bindTooltip(feature.properties.Name, { permanent: true, direction: "center", className: "IndigLandLabel", offset: [0, 0] });
    // marker.addTo(timelineMap);

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
// timelineMap.on("zoomend", checkAndChangeStylingParameters(timelineMap));
// timelineMap.on("baselayerchange", checkAndChangeStylingParameters(timelineMap));
// Function not working
function checkAndChangeStylingParameters(map) {
    var zoomLevel = map.getZoom();

    if (map.hasLayer(cadasterLayer)) {
        if (zoomLevel <= 7) {
            cadasterLayer.setStyle(
                {
                    "weight": 0
                }
            )
        }
    }
    if (map.hasLayer(Esri_WorldImagery) && map.hasLayer(cadasterLayer)) {
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

    } if (map.hasLayer(Esri_WorldImagery) && map.hasLayer(cadasterLayer)) {
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
    // map.scrollWheelZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
    if (map.tap) map.tap.enable();
    document.getElementById(mapid).style.cursor = 'grab';
}
function scrollToTop() {
    main = document.querySelector("main")
    main.scrollTo(0, 0);
}

function scrollToBottom() {
    main = document.querySelector("main")
    main.scrollTo(0, 100000);
}

function addPhaseLayer(phaseLayerName) {
    resetTimeline();

    // Set mape state to Query map
    var state = document.querySelector("#state");
    var state2 = document.querySelector("#state2");
    if ((state.innerHTML == "VIEW FULL MAP") || (state2.innerHTML == "LA CARTE")) {
        // viewFullMap();
    }
    resetLayersTimeline();

    phaseNumber = phaseLayerName.split("_")[0]

    var minSliderTextValue = document.getElementById("minRangeValue");
    var maxSliderTextValue = document.getElementById("maxRangeValue");
    var minSliderValue = document.getElementById("min-slider");
    var maxSliderValue = document.getElementById("max-slider");
    
    var elements = document.getElementById("phase-legend");
    if (elements) {
        elements.style.display = "none"
    }

    var yearLegend = L.control({ position: 'bottomleft' });
    yearLegend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend year-legend');
        div.id = "phase-legend"
        if (phaseNumber == "First") {
            startDate = 1780
            endDate = 1809
            // Having the french english divs gets complicated, maybe just show the years the user knows which phase they clicked
            div.innerHTML = `<div class="english" style="font-size:2.5rem;">First Phase</div><div class="french" style="font-size:2.5rem;">Première Phase</div><div style="font-size:2rem; justify-content: center">${startDate} - ${endDate}</div>`
        } else if (phaseNumber == "Second") {
            startDate = 1820
            endDate = 1829
            div.innerHTML = `<div class="english" style="font-size:2.5rem;">Second Phase</div><div class="french" style="font-size:2.5rem;">Seconde Phase</div><div style="font-size:2rem;">${startDate} - ${endDate}</div>`
        } else if (phaseNumber == "Third") {
            startDate = 1860
            endDate = 1889
            div.innerHTML = `<div class=""english" style="font-size:2.5rem;">Third Phase</div><div class="french" style="font-size:2.5rem;">Troisième Phase</div><div style="font-size:2rem;">${startDate} - ${endDate}</div>`
        }

        document.getElementById("greyed-out").style["z-index"] = -9999;
        document.getElementById("omit-year-query").checked = false;
        minSliderTextValue.innerHTML = startDate
        maxSliderTextValue.innerHTML = endDate
        minSliderValue.value = startDate
        maxSliderValue.value = endDate
        return div
    }
    yearLegend.addTo(timelineMap);
    timelineMap.eachLayer(function (layer) { console.log(layer) })

    fetch(`https://spencermartel.github.io/Disposession/data/geojson/${phaseLayerName}`)
        .then((response) => response.json())
        .then((r) => phaseLayerData = r)
        .then(() => {
            L.geoJSON(
                phaseLayerData,
                setOptions = {
                    style: queryStyle,
                    onEachFeature: onEachFeature
                }
            ).addTo(timelineMap);
        });

    ghostLayer = L.geoJSON(
        cadasterData,
        setOptions = {
            style: {
                fillColor: '#1f1f1e',
                weight: 0.1,
                color: '#575654',
                fillOpacity: 0.3
            }
        }
    ).addTo(timelineMap);

    timelineMap.flyToBounds(cadasterLayer, { paddingBottomRight: [500, 0] });
    scrollToTop();
}

turnOffMapInteraction(timelineMap, "timeline-map")
// Initialize the map with data, The order added affects which is on top of the other
addIndigLands();
addKanehsatakeToMain();
addCadaster(geocoding_map);
addInvisibleCadaster(timelineMap)
var markerGroup = L.layerGroup().addTo(geocoding_map);
$(document).ready(function () { setTimeout(() => { startTimeDisplay() }, "1500"); })