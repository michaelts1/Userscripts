// ==UserScript==
// @name         Google Search Ad Blocker
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Blocks ads in google searches
// @run-at       document-end
// @author       Michael T
// @match        https://www.google.com/search*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var results = document.querySelectorAll("body>div")[1].children
    results = Array.from(results)
    results.pop()
    for (let result of results) {
        if (result.querySelectorAll(".dloBPe").length !== 0) {
            result.remove()
        }
    }
    document.querySelectorAll("#taw")[0].remove()
    document.querySelectorAll("#extrares")[0].remove()
})();