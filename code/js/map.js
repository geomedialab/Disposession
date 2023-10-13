// Initialize Leaflet map
var zoom = 10.5;
var center = [45.631550, -73.809463];

// Variables for timeline
const interval = 1400;
const earliestDate = 1770;
const range = 10;
// Used to cancel timeline animation if Reset Map is pressed, eventually gets populated with setTimeout ID
var timer = null;

function scrollToTop() {
    main = document.querySelector("main")
    main.scrollTo(0, 0);
}


function viewFullMap() {
    scrollToTop();
    var introBox = document.querySelector("#intro-box")
    var queryBox = document.querySelector("#query-box");

    state = document.querySelector("#view-full-map").innerHTML;

    // Show Query Map
    if (state == "VIEW FULL MAP") {
        resetTimeline();
        timelineMap.flyTo(center, zoom);
        addCadasterToTimeline();
        addKanehsatakeToTimeline();

        introBox.style.opacity = 0;
        queryBox.style.opacity = 100;

        introBox.style.display = 'none';
        queryBox.style.display = 'block';
        document.querySelector("#view-full-map").innerHTML = "VIEW TIMELINE"

    // Show Timeline
    } else if (state == "VIEW TIMELINE") {
        console.log(state);
        startTimeDisplay();

        introBox.style.opacity = 100;
        queryBox.style.opacity = 0;
        introBox.style.display = 'block';
        queryBox.style.display = 'none';
        introBox.style.display = 'block';

        timelineMap.flyTo([45.631550, -73.709463], 10.5);
        document.querySelector("#view-full-map").innerHTML = "VIEW FULL MAP"
    }
    resetTimeline();
    resetLayersTimeline();


}
// Initialize map
var map = L.map('map',
    {
        center: center,
        zoom: zoom,
        zoomControl: false,
        fullScreenControl: false,
    });

var timelineMap = L.map('timeline-map',
    {
        center: center,
        zoom: zoom,
        zoomControl: false,
        fullScreenControl: false,
        attributionControl: false
    });

// Not sure whether to have this or not QOL thing
// timelineMap.scrollWheelZoom.disable();


var darkBasemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(timelineMap);

// Initialize Basemaps
var darkBasemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

const Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});;

// This is a convoluted function that adds IndigLandsLayer to the basemaps but is also in charge of creating the basemap control features
// It's not great coding but it works
function addIndigLands() {
    fetch("https://spencermartel.github.io/Disposession/data/geojson/Indig_lands_clipped.geojson")
        .then((response) => response.json())
        .then((r) => indigLandsData = r)
        .then(() => {
            indigLandsLayer = L.geoJSON(
                indigLandsData,
                setOptions = {
                    onEachFeature: onEachFeatureIndigLands,
                }
            );
            const basemaps = {
                "Dark Basemap": darkBasemap,
                "Satellite Basemap": Esri_WorldImagery,
            }
            const overlays = {
                "North American Indigenous lands": indigLandsLayer
            }

            L.control.layers(basemaps, overlays, {position: 'topleft'}).addTo(timelineMap);
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

const fullCadasterStyle = {
    "color": cadasterColor,
    "weight": 0.5,
    "opacity": 0.5,
};

const timelinerStyle = {
    "color": cadasterColor,
    "weight": 0.5,
    "opacity": 0,
    "fillOpacity": 0,
};

const queryStyle = {
    "color": queryColor,
    "fillColor": queryColor,
    "weight": 0.6,
    "opacity": 1,
}

const timelineStyle = {
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

function addCadaster() {
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
            cadasterLegend.addTo(map);
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
            ).addTo(map);
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

function addPhaseLayer(phaseLayerName) {
    resetTimeline();
    resetLayers();
    document.getElementsByClassName("info legend leaflet-control")[0].style.display = 'block';
    // document.getElementsByClassName("leaflet-control-layers leaflet-control")[0].style.display = 'none';

    phaseNumber = phaseLayerName.split("_")[0]

    var minSliderTextValue = document.getElementById("minRangeValue")
    var maxSliderTextValue = document.getElementById("maxRangeValue")
    var minSliderValue = document.getElementById("min-slider")
    var maxSliderValue = document.getElementById("max-slider")

    var yearLegend = L.control({ position: 'bottomleft' });
    yearLegend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend year-legend');
        if (phaseNumber == "First") {
            startDate = 1780
            endDate = 1809
            // Having the french english divs gets complicated, maybe just show the years the user knows which phase they clicked
            div.innerHTML = `<div class="english" style="font-size:2.5rem;">First Phase</div><div class="french" style="font-size:2.5rem;">Première Phase</div><div style="font-size:2rem; text-align:right;">${startDate} - ${endDate}</div>`
        } else if (phaseNumber == "Second") {
            startDate = 1820
            endDate = 1829
            div.innerHTML = `<div class="english" style="font-size:2.5rem;">Second Phase</div><div class="french" style="font-size:2.5rem;">Seconde Phase</div><div style="font-size:2rem;  text-align:right;">${startDate} - ${endDate}</div>`
        } else if (phaseNumber == "Third") {
            startDate = 1860
            endDate = 1889
            div.innerHTML = `<div class=""english" style="font-size:2.5rem;">Third Phase</div><div class="french" style="font-size:2.5rem;">Troisième Phase</div><div style="font-size:2rem;  text-align:right;">${startDate} - ${endDate}</div>`
        }

        document.getElementById("greyed-out").style["z-index"] = -9999;
        document.getElementById("omit-year-query").checked = false;
        minSliderTextValue.innerHTML = startDate
        maxSliderTextValue.innerHTML = endDate
        minSliderValue.value = startDate
        maxSliderValue.value = endDate
        return div
    }
    yearLegend.addTo(map);

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
            ).addTo(map);
        });
    map.fitBounds(cadasterLayer.getBounds());
    document.getElementsByClassName("leaflet-top leaflet-left")[0].style.display = 'none';
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

// Top left legend details
const cadasterLegend = L.control({ position: 'bottomright' });
cadasterLegend.onAdd = function () {
    const div = L.DomUtil.create('div');
    labels = [],
        categories = [
            { name: '<div class="english">Historic white settlement</div><div class="french">French text</div>', color: cadasterColor },
            { name: '<div class="english">Kanehsatà:ke today</div><div class="french">French text</div>', color: purpleColor },
        ];
    // Seignerie du Lac des Deux Montagnes
    for (var i = 0; i < categories.length; i++) {
        div.innerHTML +=
            labels.push(
                '<i class="circle" style="background:' + categories[i].color + '"></i>' +
                (categories[i].name));
    }
    div.innerHTML = labels.join("");
    return div;
}

console.log(cadasterLegend)


// Meat and potatoes of the timeline function
function timeDisplay(data, previousYear, liveYear) {

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
    // Define layer with correct array as data
    timelineLayer = L.geoJSON(
        correctArray,
        timelineStyle
    ).addTo(timelineMap);
    // Fade that layer onto map over time
    fadeInLayerLeaflet(timelineLayer, timelineStyle.opacity, fullCadasterStyle.opacity, 0.01, interval/100)

    // Recursive call 
    if (liveYear <= 1960) {
        timer = setTimeout(() => { timeDisplay(data, liveYear, (liveYear + range)); }, interval);
    } else {
        // Create and add Years to top right
        var yearLegend = L.control({ position: 'bottomleft' });
        yearLegend.onAdd = function () {
            const div = L.DomUtil.create('div', 'info legend year-legend');

            div.innerHTML = 'Hello'
            return div
        }
        resetLayersTimeline();
        startTimeDisplay();
    }
}


// Shout out this guy: https://codepen.io/maptastik/pen/MZprRJ
function fadeInLayerLeaflet(lyr, startOpacity, finalOpacity, opacityStep, delay) {
    let opacity = startOpacity;
    let timer = setTimeout(function changeOpacity() {
        if (opacity < finalOpacity) {
            lyr.setStyle({
                opacity: opacity,
            });
            opacity = opacity + opacityStep
        }

        timer = setTimeout(changeOpacity, delay);
    }, delay)
}

function resetLayers() {
    map.eachLayer(function (layer) {
        if (layer != darkBasemap) {
            if (layer != Esri_WorldImagery) {
                timelineMap.removeLayer(layer);
            }
        }
    });
}
function resetLayersTimeline() {
    timelineMap.eachLayer(function (layer) {
        // layer_id is 28 for some reason for the dark basemap
        if (layer._leaflet_id != 28) {
            if (layer != Esri_WorldImagery) {
                timelineMap.removeLayer(layer);
            }
        }
    });
}

function startTimeDisplay() {
    fetch('https://spencermartel.github.io/Disposession/data/geojson/Full_Cadaster.geojson')
        .then((response) => response.json())
        .then((data) => cadasterData = data)
        .then(() => {
            map.fitBounds(cadasterLayer.getBounds())

            // Start the timeline animation
            timeDisplay(cadasterData, earliestDate , (earliestDate + range));

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

function displayQueryResults(queryResults) {
    // Remove General Legend
    document.getElementsByClassName("leaflet-top leaflet-left")[0].style.display = 'none';
    // Build new legend
    resetLayersTimeline();



    queryLayer = L.geoJSON(
        queryResults,
        setOptions = {
            style: queryStyle,
            onEachFeature: onEachFeature
        });
    resetTimeline();
    timelineMap.addLayer(queryLayer);
    
    var lat = queryLayer.getBounds().getCenter().lat
    var lon = queryLayer.getBounds().getCenter().lng
    // Center slightly to the right of cadaster to account for intro/query box
    timelineMap.flyTo([lat,lon + 0.1], 11);
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
        "weight": 1,
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
    if (timelineMap.hasLayer(Esri_WorldImagery) && timelineMap.hasLayer(cadasterLayer)) {
        if (zoomLevel == 12) {
            cadasterLayer.setStyle(
                {
                    "weight": 1.5
                }
            )

        } if (zoomLevel > 12) {
            console.log("zoom > 12");
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

// Initialize the map with data, The order added affects which is on top of the other
addIndigLands();
addKanehsatakeToMain();
addCadaster();

$(document).ready(function () { startTimeDisplay(); })
cadasterLegend.addTo(timelineMap);