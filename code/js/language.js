
function changeLanguage() {
    var language = checkCookie();
    console.log(language)

    if (language == "english") {
        changeToFrench();
    }
    else if (language == "french") {
        changeToEnglish();
    }
    var noData = document.getElementById("no-data");
    if (noData !== null) {
        noData.style.display = "none";
    }
}

function changeToFrench() {
    const englishDivs = document.getElementsByClassName("english");
    const frenchDivs = document.getElementsByClassName("french");

    for (i = 0; i < englishDivs.length; i++) {
        englishDivs[i].style.display = "none";
    }
    for (i = 0; i < frenchDivs.length; i++) {
        frenchDivs[i].style.display = "block";
    }

    document.cookie = 'Language=french; domain=https://spencermartel.github.io/Disposession/'
}

function changeToEnglish() {
    const englishDivs = document.getElementsByClassName("english");
    const frenchDivs = document.getElementsByClassName("french");

    for (i = 0; i < englishDivs.length; i++) {
        englishDivs[i].style.display = "block";
    }
    for (i = 0; i < frenchDivs.length; i++) {
        frenchDivs[i].style.display = "none";
    }

    document.cookie = 'Language=english; doimain=https://spencermartel.github.io/Disposession/'
}

function checkCookie() {
    var cookies = document.cookie.split("; ");
    var language = cookies[0].split("=")[1];
    console.log(cookies)
    return language;
}


function pageLoadLanguageCheck() {
    var languageSwitch = document.getElementById("language-toggle");
    var language = checkCookie();
    console.log(language);

    if (language == "french") {
        languageSwitch.click()
        changeToFrench();
    }
}