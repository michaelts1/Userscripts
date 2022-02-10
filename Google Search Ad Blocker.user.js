// ==UserScript==
// @name         Google Search QoL
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Blocks ads and fixes links in Google Search
// @run-at       document-end
// @author       Michael T
// @match        https://www.google.com/search*
// @grant        none
// ==/UserScript==
(function() {
	"use strict"

    function removeAds() {  
      let results = document.querySelectorAll("body > div")?.[1].children

      results = Array.from(results)
      results.pop()

      for (const result of results) {
          if (result.querySelectorAll(".dloBPe").length > 0) {
              result.remove()
          }
      }

      const sectionsToRemove = [
        "#taw", "#extrares", "g-section-with-header", "#botstuff", ".xERobd", ".uVMCKf.aNytqb",
        ".mnr-c", "[aria-label*='authorities']", "[aria-label*='Health information']", "[aria-label*='People also search for']",
        "[aria-label*='national resources']", "[aria-label='Vaccines']", "[aria-label='Top stories']", "[aria-label='Statistics']",
        ".MjUjnf.VM6qJ.ccRsrb", ".Ml4I6c", "[data-tab='HealthStats']", ".JNkvid.gsrt.lPubzd.wp-ms"
      ]
      
      for (const selector of sectionsToRemove) {
        const section = document.querySelector(selector)//+':not(:has(#kp-wp-tab-cont-overview))')
        if (section) {
          console.log("Removing", section)
          section.remove()
        }
      }
    }
  
    function convertLinks() {
      const links = document.querySelectorAll("#search a[href*='/url?']")
      console.log("Fixing links:", links)

      for (const link of Array.from(links)) {
        const params = new URLSearchParams(link.href)
        const href = params.get("url")
        link.href = href
      }
    }

    removeAds()
    window.addEventListener("mousedown", convertLinks)
      
    const css = document.createElement("style")
    css.innerHTML = `[aria-label="Top results"] { margin-top: 0 !important; }`
    document.body.appendChild(css)
    console.log("Added custom css")
})();
