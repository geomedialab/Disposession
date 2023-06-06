function createSoldToIndex(inputId) {
    var index = []
    for (var i = 0; i < cadasterData.features.length; i++) {
        obj1 = cadasterData.features[i].properties.SOLD_TO
        obj2 = cadasterData.features[i].properties.CONCEDED_T
        index.push(obj1);
        index.push(obj2)
    }
    var uniq = [...new Set(index)];
    createPElementsForSearch(uniq, 'buyerUL', inputId)
}

function createConceededByIndex(inputId) {
    var index = []
    for (var i = 0; i < cadasterData.features.length; i++) {
        obj = cadasterData.features[i].properties.CONCEDED_B
        index.push(obj);
    }
    var uniq = [...new Set(index)];
    createPElementsForSearch(uniq, 'conceededByUL', inputId)
}

function createorigAIndex(inputId) {
    var index = []
    for (var i = 0; i < cadasterData.features.length; i++) {
        obj = cadasterData.features[i].properties.ORIGINAL_A
        index.push(obj);
    }
    var uniq = [...new Set(index)];
    createPElementsForSearch(uniq, 'originalAUL', inputId)
}

function createYearSoldIndex(inputId) {
    var index = []
    for (var i = 0; i < cadasterData.features.length; i++) {
        obj = cadasterData.features[i].properties.year
        index.push(obj);
    }
    index.sort()

    let uniqYears = [...new Set(index)];

    createPElementsForSearch(uniqYears, 'yearUL', inputId)
}

function createLotNumberIndex(inputId) {
    var index = []
    for (var i = 0; i < cadasterData.features.length; i++) {
        obj = cadasterData.features[i].properties.LOT_NUMBER
        index.push(obj);
    }
    var uniq = [...new Set(index)];

    createPElementsForSearch(uniq, 'lotNumberUL', inputId)
}

function createNumEnregiIndex(inputId) {
    var index = []
    for (var i = 0; i < cadasterData.features.length; i++) {
        obj = cadasterData.features[i].properties.NUM_ENREGI
        index.push(obj);
    }
    index.sort()
    var uniq = [...new Set(index)];

    createPElementsForSearch(uniq, 'numEnregiUL', inputId)
}

function createPElementsForSearch(array, ulId, inputId,) {
    for (i = 0; i < array.length; i++) {
        let newValue = array[i];
        const spanElement = document.createElement("span");
        const pElement = document.createElement("p");
        const ulElement = document.getElementById(ulId);
        const inputElement = document.getElementById(inputId);

        pElement.innerHTML = newValue;

        spanElement.addEventListener("click", function () {
            inputElement.value = newValue;
            if (inputId == 'geocoding-search') {
                placeMapMarker(newValue);
            }
            ulElement.style.display = 'none';
        })

        const container = document.getElementById(ulId)
        document.addEventListener("mouseup", function (e) {
            if (!ulElement.contains(e.target)) {
                ulElement.style.display = "none";
                inputElement.style.borderRadius = "calc(var(--radius) - 5px)";
            }
        })
        container.appendChild(spanElement);
        spanElement.appendChild(pElement);
    }
}

function showSelectableFields(inputId, ulId) {
    
    // Declare variables
    var input, filter, ul, i, txtValue;
    input = document.getElementById(inputId);
    filter = input.value.toUpperCase();
    ul = document.getElementById(ulId);
    p = ul.getElementsByTagName('p');

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < p.length; i++) {
        a = p[i];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            p[i].style.display = "";
        } else {
            p[i].style.display = "none";
        }
    }
}


function showList(inputId, uLId) {
    document.getElementById(inputId).style.borderRadius = "calc(var(--radius) - 5px) calc(var(--radius) - 5px) 0 0"
    ul = document.getElementById(uLId)
    ul.style.display = 'block';
}


function filterQuery() {

    const soldToQuery = document.getElementById("buyerQuery").value;
    const conceededByQuery = document.getElementById("conceededByQuery").value;
    const lotNumberQuery = document.getElementById("lotNumberQuery").value;
    const yearQuery = document.getElementById("yearQuery").value;
    const numEnregiQuery = document.getElementById("numEnregiQuery").value;
    const originalAQuery = document.getElementById("originalAQuery").value;

    const data = cadasterData.features;
    var queryResults = []

    // Loop over data, push the lots passing conditions to queryResultys array
    for (i = 0; i < data.length; i++) {
        var featureData = data[i].properties

        // This is the magic that is the actual filtering of whether the filter is wanted & if it is to filter it.
        if ((!soldToQuery || (featureData.SOLD_TO || featureData.CONCEDED_T) == soldToQuery) //
            && (!conceededByQuery || featureData.CONCEDED_B == conceededByQuery)//
            && (!yearQuery || featureData.year == yearQuery)//
            && (!originalAQuery || featureData.ORIGINAL_A == originalAQuery)//
            && (!numEnregiQuery || featureData.NUM_ENREGI == numEnregiQuery)//
            && (!lotNumberQuery || featureData.LOT_NUMBER == lotNumberQuery))//
        {
            queryResults.push(data[i]);
        }
    }

    if (queryResults.length != 0) {
        displayQueryResults(queryResults)
        document.getElementsByClassName("info legend leaflet-control")[0].style.display = 'none';
    } else {
        document.getElementById("no-data").style.display = "block"
    }
}

function resetInputs() {
    document.getElementById("geocoding-search").value = "";
    document.getElementById("buyerQuery").value = "";
    document.getElementById("conceededByQuery").value = "";
    document.getElementById("originalAQuery").value = "";
    document.getElementById("lotNumberQuery").value = "";
    document.getElementById("numEnregiQuery").value = "";
    document.getElementById("yearQuery").value = "";
}

function resetUls() {
    document.getElementById("buyerUL").innerHTML = "";
    document.getElementById("conceededByUL").innerHTML = "";
    document.getElementById("lotNumberUL").innerHTML = "";
    document.getElementById("yearUL").innerHTML = "";
    document.getElementById("numEnregiUL").innerHTML = "";
    document.getElementById("originalAUL").innerHTML = "";
}