function changeLanguage() {
    var language = checkLanguage();

    if (language == "english" || language == null) {
        changeToFrench();
    }
    else if (language == "french") {
        changeToEnglish();
    }
}

function changeToFrench() {
    const englishDivs = document.getElementsByClassName("english");
    const frenchDivs = document.getElementsByClassName("french");

    // change styles of english and french divs
    for (i = 0; i < englishDivs.length; i++) {
        englishDivs[i].style.display = "none";
    }
    for (i = 0; i < frenchDivs.length; i++) {
        frenchDivs[i].style.display = "block";
    }

    // remove any no-data elements so they don't blink uneccessarily
    var noDataFrench = document.getElementById("no-data-french");
    var noDataEnglish = document.getElementById("no-data");
    
    if (noDataFrench !== null) {
        noDataFrench.style.display = "none";
    }
    if (noDataEnglish !== null) {
        noDataEnglish.style.display = "none";
    }

    localStorage.setItem("Language", "french")
    console.log("Language set to french")
}

function changeToEnglish() {
    const englishDivs = document.getElementsByClassName("english");
    const frenchDivs = document.getElementsByClassName("french");

    // change styles of english and french divs
    for (i = 0; i < englishDivs.length; i++) {
        englishDivs[i].style.display = "block";
    }
    for (i = 0; i < frenchDivs.length; i++) {
        frenchDivs[i].style.display = "none";
    }

    // remove any no-data elements so they don't blink uneccessarily
    var noDataFrench = document.getElementById("no-data-french");
    var noDataEnglish = document.getElementById("no-data");
    console.log(noDataEnglish)
    if (noDataFrench !== null) {
        noDataFrench.style.display = "none";
    }
    if (noDataEnglish !== null) {
        noDataEnglish.style.display = "none";
    }

    // Set local storage data
    localStorage.setItem("Language", "english")
    console.log("Language set to english")
}

function checkLanguage() {
    var language = localStorage.getItem("Language")
    return language;
}


function pageLoadLanguageCheck() {
    var languageSwitch = document.getElementById("language-toggle");
    var language = checkLanguage();

    if (language == "french") {
        languageSwitch.click()
        changeToFrench();
    }
}