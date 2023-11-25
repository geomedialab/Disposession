function callNominatim() {
    var address = document.getElementById("geocoding-search").value;
    document.getElementById("no-address").style.display = "none";
    document.getElementById("not-in-polygon").style.display = "none";

    // Show loading UI
    var loading = document.getElementById("loading");
    console.log(loading);
    var submit = document.getElementById("enter-address");
    submit.style.display = "none";
    loading.style.display = "block";

    fetch(`https://nominatim.openstreetmap.org/?format=json&limit=10&q=${address}&viewbox=-73.94872447814616,45.800160073566694,-74.2476919394601,
    45.458188453350466&bounded=1`)
        .then((response) => response.json())
        .then((data) => addressData = data)
        .then(() => {

            // Remove loading UI
            loading.style.display = "none";
            submit.style.display = "block";

            const indexData = []
            for (i = 0; i < addressData.length; i++) {
                indexData.push(addressData[i].display_name)
            }

            // Reset array for each search
            if (indexData.length != 0) {
                document.getElementById("geocodingUL").innerHTML = "";
                createPElementsForSearch(indexData, 'geocodingUL', 'geocoding-search', )
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
            var geocodedMarker = L.marker(
                [Number(addressData[i].lat), Number(addressData[i].lon)]
            ).bindTooltip(
                addressData[i].display_name
            );
        }
    }
    pointInPoly(geocodedMarker)
}