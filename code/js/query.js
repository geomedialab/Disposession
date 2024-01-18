// function createConceededByIndex(inputId) {
//     var index = []
//     for (var i = 0; i < cadasterData.features.length; i++) {
//         obj = cadasterData.features[i].properties.CONCEDED_B
//         index.push(obj);
//     }
//     var uniq = [...new Set(index)];
//     createPElementsForSearch(uniq, 'conceededByUL', inputId, "conceededByQuery-label")
// }

// function createSoldToIndex(inputId) {
//     var index = []
//     for (var i = 0; i < cadasterData.features.length; i++) {
//         obj1 = cadasterData.features[i].properties.SOLD_TO
//         obj2 = cadasterData.features[i].properties.CONCEDED_T
//         index.push(obj1);
//         index.push(obj2);
//     }
//     var uniq = [...new Set(index)];
//     createPElementsForSearch(uniq, 'buyerUL', inputId, "buyerQuery-label")
// }

// function createNumEnregiIndex(inputId) {
//     var index = []
//     for (var i = 0; i < cadasterData.features.length; i++) {
//         obj = cadasterData.features[i].properties.NUM_ENREGI
//         index.push(obj);
//     }
//     index.sort()
//     var uniq = [...new Set(index)];

//     createPElementsForSearch(uniq, 'numEnregiUL', inputId, "numEnregiQuery-label")
// }

// function createorigAIndex(inputId) {
//     var index = []
//     for (var i = 0; i < cadasterData.features.length; i++) {
//         obj = cadasterData.features[i].properties.ORIGINAL_A
//         index.push(obj);
//     }
//     var uniq = [...new Set(index)];
//     createPElementsForSearch(uniq, 'originalAUL', inputId, "originalAQuery-label")
// }

// function createPElementsForSearch(array, ulId, inputId, labelId) {
//     for (i = 0; i < array.length; i++) {
//         let newValue = array[i];
//         const spanElement = document.createElement("span");
//         const pElement = document.createElement("p");
//         const ulElement = document.getElementById(ulId);
//         const inputElement = document.getElementById(inputId);
//         const parentLabel = document.getElementById(labelId);
//         pElement.classList.add("machina");
//         pElement.innerHTML = newValue;

//         inputElement.addEventListener("keydown", function () {
//             if (parentLabel) {
//                 parentLabel.style.display = 'none';
//             }
//         });

//         spanElement.addEventListener("click", function () {
//             inputElement.value = newValue;
//             if (inputId == 'geocoding-search') {
//                 placeMapMarker(newValue);
//             }
//             ulElement.style.display = 'none';
//             inputElement.style.borderRadius = "calc(var(--radius) - 5px)";
//             if (ulId != "geocodingUL") {
//                 parentLabel.style.display = 'none'
//             }
//         });

//         const container = document.getElementById(ulId)
//         document.addEventListener("mouseup", function (e) {
//             if (!ulElement.contains(e.target)) {
//                 ulElement.style.display = "none";
//                 inputElement.style.borderRadius = "calc(var(--radius) - 5px)";
//             }
//         });
//         container.appendChild(spanElement);

//         container.classList.add("machina")
//         spanElement.appendChild(pElement);
//         spanElement.addEventListener("mouseenter", (event => {
//             document.body.style.cursor = "pointer"
//         }))
//         spanElement.addEventListener("mouseleave", (event => {
//             document.body.style.cursor = "auto"
//         }))
//     }
// }

// function showSelectableFields(inputId, ulId) {
//     // Declare variables
//     var input, filter, ul, i, txtValue;
//     input = document.getElementById(inputId);
//     filter = input.value.toUpperCase();
//     ul = document.getElementById(ulId);
//     p = ul.getElementsByTagName('p');

//     // Loop through all list items, and hide those who don't match the search query
//     for (i = 0; i < p.length; i++) {
//         a = p[i];
//         txtValue = a.textContent || a.innerText;
//         if (txtValue.toUpperCase().indexOf(filter) > -1) {
//             p[i].style.display = "";
//         } else {
//             p[i].style.display = "none";
//         }
//     }
// }


// function showList(inputId, uLId) {
//     document.getElementById(inputId).style.borderRadius = "calc(var(--radius) - 5px) calc(var(--radius) - 5px) 0 0"
//     ul = document.getElementById(uLId)
//     ul.style.display = 'block';
// }

// function filterQuery() {

//     var checked = document.getElementById("omit-year-query").checked;

//     if (checked) {
//         var startYearQuery = 1760;
//         var endYearQuery = 1960
//     } else {
//         var startYearQuery = Number(document.getElementById("min-slider").value);
//         var endYearQuery = Number(document.getElementById("max-slider").value);
//     }

//     const soldToQuery = document.getElementById("buyerQuery").value;
//     const conceededByQuery = document.getElementById("conceededByQuery").value;
//     const numEnregiQuery = document.getElementById("numEnregiQuery").value;
//     const originalAQuery = document.getElementById("originalAQuery").value;

//     const data = cadasterData.features;
//     var queryResults = []

//     // Loop over data, push the lots passing conditions to queryResultys array
//     for (i = 0; i < data.length; i++) {
//         var featureData = data[i].properties

//         // This is the magic that is the actual filtering of whether the filter is wanted & filter it if it is.
//         if (
//             (!soldToQuery || (featureData.SOLD_TO || featureData.CONCEDED_T) == soldToQuery) //
//             && (!conceededByQuery || (featureData.CONCEDED_B || featureData.SOLD_BY) == conceededByQuery)//
//             && (featureData.year >= startYearQuery && featureData.year <= endYearQuery)//
//             && (!originalAQuery || featureData.ORIGINAL_A == originalAQuery)//
//             && (!numEnregiQuery || featureData.NUM_ENREGI == numEnregiQuery)//
//         ) {
//             queryResults.push(data[i]);
//         }
//     }

//     if (queryResults.length != 0) {
//         displayQueryResults(queryResults, timelineMap)
//     } else {
//         resetLayersTimeline();
//             document.querySelector("all-queries").scrollTo(1000, 0);

//         if (document.getElementById("query-legend")) {
//             document.getElementById("query-legend").style.display = "none";
//         }
//         var language = checkLanguage();
//         if (language == "french") {
//             document.getElementById("no-data-french").style.display = "block"
//         } else {
//             document.getElementById("no-data").style.display = "block"
//         }
//     }
// }

// function resetInputs() {
//     // document.getElementById("geocoding-search").value = "";
//     document.getElementById("buyerQuery").value = "";
//     document.getElementById("conceededByQuery").value = "";
//     document.getElementById("originalAQuery").value = "";
//     document.getElementById("numEnregiQuery").value = "";

//     document.getElementById("min-slider").value = "1810";
//     document.getElementById("minRangeValue").innerHTML = "1810";

//     document.getElementById("max-slider").value = "1930";
//     document.getElementById("maxRangeValue").innerHTML = "1930";
//     var queryLabels = document.getElementsByClassName("query-label");
//     for (i = 0; i < queryLabels.length; i++) {
//         queryLabels[i].style.display = 'block';
//     }
// }

// function changeYearDisplay() {

//     var checked = document.getElementById("omit-year-query").checked;
//     var greyedOut = document.getElementById("greyed-out");

//     // Lock out user if all years is checked
//     if (checked) {
//         greyedOut.style["z-index"] = 9999

//     } else {
//         greyedOut.style["z-index"] = -9999
//     }
// }

// function hideGeocodingLabel() {
//     var label = document.getElementById("geocoding-search-label")
//     label.style.display = "none"
// }