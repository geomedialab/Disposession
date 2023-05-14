function createSoldToIndex(indexArray) {

    for (var i=0; i< cadasterData.features.length; i++) {
        obj = cadasterData.features[i].properties.SOLD_TO
        indexArray.push(obj);
    }
    uniq = [...new Set(indexArray)];
    createPElementsForSearch('buyerUL')
}

function createSoldbyIndex(indexArray) {

    for (var i=0; i< cadasterData.features.length; i++) {
        obj = cadasterData.features[i].properties.SOLD_BY
        indexArray.push(obj);
    }
    uniq = [...new Set(indexArray)];
    createPElementsForSearch('sellerUL')
}

function createnumEnregiIndex(indexArray) {

    for (var i=0; i< cadasterData.features.length; i++) {
        obj = cadasterData.features[i].properties.NUM_ENREGI
        indexArray.push(obj);
    }
    uniq = [...new Set(indexArray)];
}

function createorigAIndex(indexArray) {

    for (var i=0; i< cadasterData.features.length; i++) {
        obj = cadasterData.features[i].properties.ORIGINAL_A
        indexArray.push(obj);
    }
    uniq = [...new Set(indexArray)];
    createPElementsForSearch('originalAUL')

}

function createLotNumberIndex(indexArray) {

    for (var i=0; i< cadasterData.features.length; i++) {
        obj = cadasterData.features[i].properties.LOT_NUMBER
        indexArray.push(obj);
    }
    uniq = [...new Set(indexArray)];

}

function createYearSoldIndex(indexArray) {

    for (var i=0; i< cadasterData.features.length; i++) {
        obj = cadasterData.features[i].properties.times
        indexArray.push(obj);
    }
    uniq = [...new Set(indexArray)];
    createPElementsForSearch('yearUL')
}

function createPElementsForSearch(ulId) {
    for (i = 0; i < uniq.length; i++) {
        var name = uniq[i]
        var spanElement = document.createElement("span");
        var pElement = document.createElement("p")
        pElement.innerHTML = name

        var container = document.getElementById(ulId)
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