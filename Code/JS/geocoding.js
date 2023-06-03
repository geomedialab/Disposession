function callNominatim() {
    var address = document.getElementById("geocoding-search").value

    fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${address}&viewbox=-74.571810,45.880457,-73.733248,45.463068&bounded=1`)
        .then((response) => response.json())
        .then((data) => addressData = data)
        .then(() => {
            console.log(addressData)
            var indexData = []
            for (i = 0; i < addressData.length; i++) {
                indexData.push(addressData[i].display_name)
            }
            console.log(indexData)
            createPElementsForSearch(indexData, 'geocodingUL', 'geocoding-search')
            showList('geocoding-search', 'geocodingUL')
        });
}

function placeMapMarker(newValue) {
    for (i = 0; i < addressData.length; i++) {
        if (addressData[i].display_name == newValue) {
            console.log([Number(addressData[i].lat), Number(addressData[i].lon)])
            L.marker([Number(addressData[i].lat), Number(addressData[i].lon)]).addTo(map);
        }
    }
}