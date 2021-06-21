// ==UserScript==
// @name         Kineret Editor
// @version      0.1
// @description  try to take over the world!
// @author       Michael T
// @match        http://kineret.org.il/
// @grant        none
// ==/UserScript==

(function() {
    'use strict'
    var script = document.createElement("script")
    script.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js")
    document.head.appendChild(script)
    setTimeout( () => {
        var element = $(".hp_miflas_height")[0]
        let miflas = $(element).text().slice(1)
        miflas += "-"
        $(element).text(miflas)
        element.innerHTML += `<br><a id="wikipedia" href="//he.wikipedia.org/w/index.php?title=הכנרת&action=edit" target="_blank">הכנרת - ויקיפדיה</a>`
        $("#wikipedia").css({"color":"#6800ff42"})
        $(element).click( () => {
             //currently does not work since the page is not https
            //navigator.clipboard.writeText(miflas)
            console.log("clicked")
        })
    }, 2000)
})()