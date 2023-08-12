function callNominatim() {
    var address = document.getElementById("geocoding-search").value;
    document.getElementById("no-address").style.display = "none";
    document.getElementById("not-in-polygon").style.display = "none";

    // Show loading UI
    var loading = document.getElementById("loading");
    var submit = document.getElementById("submit-query");
    submit.innerText = "";
    loading.style.display = "block";

    fetch(`https://nominatim.openstreetmap.org/?format=json&limit=10&q=${address}&viewbox=-73.94872447814616,45.800160073566694,-74.2476919394601,
    45.458188453350466&bounded=1`)
        .then((response) => response.json())
        .then((data) => addressData = data)
        .then(() => {

            // Remove loading UI
            loading.style.display = "none";
            submit.innerText = "Submit Address";
            submit.appendChild(loading);

            const indexData = []
            for (i = 0; i < addressData.length; i++) {
                indexData.push(addressData[i].display_name)
            }

            // Reset array for each search
            if (indexData.length != 0) {
                document.getElementById("geocodingUL").innerHTML = "";
                createPElementsForSearch(indexData, 'geocodingUL', 'geocoding-search')
                showList('geocoding-search', 'geocodingUL')
            }
            else {
                document.getElementById("no-address").style.display = "block"
            }
        });
}

function placeMapMarker(newValue) {
    for (i = 0; i < addressData.length; i++) {
        if (addressData[i].display_name == newValue) {
            console.log(addressData[i])
            var geocodedMarker = L.marker(
                [Number(addressData[i].lat), Number(addressData[i].lon)]
            ).bindTooltip(
                addressData[i].display_name
            );
        }
    }
    pointInPoly(geocodedMarker)
}

function changeLanguage() {
    const englishDivs = document.getElementsByClassName("english");
    const frenchDivs = document.getElementsByClassName("french");

    console.log(englishDivs);
    console.log(frenchDivs);

    // Check if we're in english already
    if (englishDivs[0].style.display != "none") {
        for (i = 0; i < englishDivs.length; i++) {
            englishDivs[i].style.display = "none";
        }
        for (i = 0; i < frenchDivs.length; i++) {
            frenchDivs[i].style.display = "block";
        }
    }
    else {
        for (i = 0; i < englishDivs.length; i++) {
            englishDivs[i].style.display = "block";
        }
        for (i = 0; i < frenchDivs.length; i++) {
            frenchDivs[i].style.display = "none";
        }
    }
}