var incrementLand = setInterval(function () {
    var landGranted = document.getElementById("land-granted");
    var landGrantedValue = parseInt(document.getElementById("land-granted").textContent);
    var increment = 5
    if (landGrantedValue == (540 - increment)) {
        clearInterval(incrementLand);
    }
    landGranted.innerHTML = (landGrantedValue + increment) + ` km<sup>2</sup>`
}, 200);

var incrementParcels = setInterval(function () {
    var parcelsDistributed = document.getElementById("parcels-distributed");
    var parcelsDistributedValue = parseInt(parcelsDistributed.textContent)
    var increment = 15
    if (parcelsDistributedValue == (1830 - increment)) {
        clearInterval(incrementParcels);
    }
    parcelsDistributed.textContent = parcelsDistributedValue + increment
}, 120);

var incrementYears = setInterval(function () {
    var years = document.getElementById("years-table");
    var yearsValue = parseInt(years.textContent)
    var increment = 5
    if (yearsValue == (200 - increment)) {
        clearInterval(incrementYears);
    }
    years.textContent = yearsValue + increment
}, 250);

var incrementPercent = setInterval(function () {
    var landRemains = document.getElementById("land-remains");
    var landRemainsValue = parseInt(landRemains.textContent)
    var increment = 2
    if (landRemainsValue == (2 + increment)) {
        clearInterval(incrementPercent);
    }
    landRemains.innerHTML = (landRemainsValue - increment) + "%"
}, 200);