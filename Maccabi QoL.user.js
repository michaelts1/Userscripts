// ==UserScript==
// @name        Maccabi QoL
// @match       https://mac.maccabi4u.co.il/login
// @grant       none
// @version     1.0
// @author      Michael T
// @description Changes the background picture and auto switches to the "Login With Password" tab
// @run-at document-idle
// ==/UserScript==

"use strict"

document.querySelector(".full-width-image.container").style.backgroundImage = "url(../images/backgroundImgKosher.png)"

window.addEventListener("load", () =>{
    document.querySelector("[href='#IdentifyWithPassword']").click()
})