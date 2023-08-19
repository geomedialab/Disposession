function changeLanguage() {
    console.log("button pressed")
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