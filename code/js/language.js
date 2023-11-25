document.cookie = "Language=english;"

function changeLanguage() {
    const englishDivs = document.getElementsByClassName("english");
    const frenchDivs = document.getElementsByClassName("french");

    if (englishDivs[0].style.display != "none") {
        for (i = 0; i < englishDivs.length; i++) {
            englishDivs[i].style.display = "none";
        }
        for (i = 0; i < frenchDivs.length; i++) {
            frenchDivs[i].style.display = "block";
        }
        document.cookie = "Language=french;"
    }
    else {
        for (i = 0; i < englishDivs.length; i++) {
            englishDivs[i].style.display = "block";
        }
        for (i = 0; i < frenchDivs.length; i++) {
            frenchDivs[i].style.display = "none";
        }
        document.cookie = "Language=english;"
    }
    var noData = document.getElementById("no-data");
    if (noData !== null){
        noData.style.display = "none";
    }
}

function checkCookie() {
    var cookies = document.cookie.split("; ");
    console.log(cookies)
    var language = cookies[0].split("=")[1];
    return language;
}


function pageLoadLanguageCheck() {
    var languageSwitch = document.getElementById("language-toggle");
    var language = checkCookie();
    console.log(language)
    if (language == "french") {
        languageSwitch.click();
    }
}