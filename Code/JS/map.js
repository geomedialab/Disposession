// Initialize Leaflet map
var zoom = 11;
var center = [45.627687, -74.073016];
var control;

// Variables for timeline
const interval = 1000;
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

// Initialize Basemap
const Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);


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
    "weight": 0.2,
    "opacity": 0.5,
    "fillOpacity": 1
}

const kanehsatakeStyle = {
    "color": purpleColor,
    "weight": 1,
    "opacity": 1,
}

function addMerged() {
    fetch('../../Data/GEOJSON/mergedCadaster.geojson')
        .then((response) => response.json())
        .then((data) => mergedData = data)
        .then(() => {
            console.log(mergedData)
            mergedLayer = L.geoJSON(
                mergedData,
                setOptions = {
                    style: kanehsatakeStyle,
                }).addTo(map);
        })
}

async function addCadaster() {
    fetch('../../Data/GEOJSON/Full_Cadaster.geojson')
        .then((response) => response.json())
        .then((data) => cadasterData = data)
        .then(() => {
            cadasterLegend.addTo(map);
            // Dynamically build selection options for queries
            // This lets the data be "alive" by accepting any new geoJSON after being run through Exploration.ipynb
            createSoldToIndex("buyerQuery")
            createConceededByIndex("conceededByQuery")
            createorigAIndex("originalAQuery")
            createYearSoldIndex("yearQuery");
            createLotNumberIndex("lotNumberQuery");
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

function pointInPoly(marker) {
    const latLng = marker.getLatLng();
    cadasterLayer.eachLayer(function (indivLot) {
        if (indivLot.contains(latLng)) {
            displayQueryResults(indivLot.feature)
            marker.addTo(map);
        }
        else {
            document.getElementById("not-in-polygon").style.display = "block";
        }
    })
}

function addKanehsatake() {
    fetch('../../Data/GEOJSON/kanehsatake.geojson')
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

const cadasterLegend = L.control({ position: 'topleft' });

cadasterLegend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    labels = [],
        categories = [{ name: 'White settlement', color: cadasterColor }, { name: 'Kahnesatake', color: purpleColor }];
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

const timelinePlayControl = L.control({ position: 'bottomleft' });
timelinePlayControl.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');

    div.innerHTML = 'Experience disposession through time\
    <button class="button play" onclick="startTimeDisplay()"></button>'
    return div
}
timelinePlayControl.addTo(map);

function timeDisplay(data, previousYear, liveYear) {

    var elements = document.getElementsByClassName('info legend year-legend leaflet-control');
    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }


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

        if ((featureTime > previousYear) && (featureTime <= (previousYear + range))) {
            correctArray.push(data.features[i])
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
        document.getElementsByClassName("info legend leaflet-control")[0].style.display = 'block';
        document.getElementsByClassName('info legend year-legend leaflet-control')[0].style.display = 'none';
        document.getElementsByClassName("leaflet-bottom")[0].style.display = 'block';
        map.addLayer(kanehsatakeLayer);
        map.removeLayer(mergedLayer)
        console.log('Timeline Completed')
    }
}

function startTimeDisplay() {
    map.fitBounds(cadasterLayer.getBounds());
    map.eachLayer(function (layer) {
        if (layer != Stadia_AlidadeSmoothDark) {
            map.removeLayer(layer);
        }
    });

    // document.getElementsByClassName("info legend leaflet-control")[0].style.display = 'none';
    document.getElementsByClassName("leaflet-bottom")[0].style.display = 'none';
    addMerged();

    fetch('../../Data/GEOJSON/Full_Cadaster.geojson')
        .then((response) => response.json())
        .then((data) => cadasterData = data)
        .then(() => setTimeout(() => { timeDisplay(cadasterData, earliestDate, (earliestDate + range)); }, 800));
}


function resetMap() {
    map.eachLayer(function (layer) {
        if (layer != Stadia_AlidadeSmoothDark) {
            map.removeLayer(layer);
        }
    });

    resetInputs();
    resetUls();
    addKanehsatake();
    addCadaster();

    document.getElementById("no-data").style.display = "none";
    document.getElementById("no-address").style.display = "none";
    document.getElementById("not-in-polygon").style.display = "none";

    document.getElementsByClassName("info legend leaflet-control")[0].style.display = 'block';
    map.fitBounds(cadasterLayer.getBounds());
}



var queryLayer = L.geoJSON();
var cadasterLayer = L.geoJSON();
var timelineLayer = L.geoJSON();
var kanehsatakeLayer = L.geoJSON();

function displayQueryResults(queryResults) {
    map.eachLayer(function (layer) {
        if (layer != Stadia_AlidadeSmoothDark) {
            map.removeLayer(layer);
        }
    });

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

var onEachFeature = function (feature, layer) {
    // Capitalize the first word of original deed sale variable
    const word = feature.properties.ORIGINAL_A
    const capitalized =
        word.charAt(0)
        + word.slice(1).toLowerCase()

    if (feature.properties.CONCEDED_T != null) {
        var wayOfSale = 'Conceeded'
        var soldOrConceeded = `<br>Conceeded by: ${feature.properties.CONCEDED_B}
                           <br>Conceeded to: ${feature.properties.CONCEDED_T}`
    } else {
        var wayOfSale = 'Sold'
        var soldOrConceeded = `<br><br>Sold by: ${feature.properties.SOLD_BY}
        <br>Sold to: ${feature.properties.SOLD_TO}`
    }


    layer.bindPopup(
        `<center><h2>Lot number ${feature.properties.LOT_NUMBER}</h2><h3>` + wayOfSale + ` ${feature.properties.DATE_MM_DD}</center></h3>`
        + soldOrConceeded +
        `<br><br>Registration number: ${feature.properties.NUM_ENREGI}
                     <br>Found original sale: ${capitalized}
                     <br>Acreage: ${(feature.properties.Area_new_1 / 247.105).toFixed(2)} acres
                     <br><br>Notes: ${feature.properties.NOTES}`,
        // Styling tooltip Options
        {
            sticky: true,
            opacity: 0.8,
        }
    );
    layer.bindTooltip(`
     <center>
     <h2>Lot number ${feature.properties.LOT_NUMBER}</h2>
     </center>`);
}
addKanehsatake();
addCadaster();