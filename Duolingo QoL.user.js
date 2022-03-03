// ==UserScript==
// @name        Duolingo QoL
// @description Duolingo quality of life features
// @match       https://www.duolingo.com/*
// @grant       none
// @version     1.0.0
// @author      Michael T
// ==/UserScript==

"use strict"

/* == Constants ==*/

const storiesToHide = [
	"The Honeymoon",
	"A Very Big Family",
	"Where Is Your Girlfriend?",
	"A Love Letter",
	"The Ex-Girlfriend",
	"Why Did She Break Up with Me?",
	"I'm Going to Rome",
	"Do You Want to Break up with Me?",
	"Is It Love?"
]

const imagesToHide = [
  "https://d2pur3iezf4d1j.cloudfront.net/images/af72ee551cceae45eccbe363900213d3",
  "https://d2pur3iezf4d1j.cloudfront.net/images/204f805969b1a0e77cfdf93494a81998",
  "https://d2pur3iezf4d1j.cloudfront.net/images/64daad7ae9d55baae9a97ab65a1fc944",
  "https://d2pur3iezf4d1j.cloudfront.net/images/2e8958904b95485dc7d6c9d4f412f697",
  "https://d2pur3iezf4d1j.cloudfront.net/images/ac5c08e95c0fdcc4bba2502616658e00",
]

/* == Helper functions == */

const $ = selector => document.querySelectorAll(selector)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

// `console` is overwritten by Duolingo, So we need to steal the original `console` from an iframe.
// Credit: https://stackoverflow.com/a/7081490
const consoleFrame = document.createElement('iframe')
consoleFrame.style.display = "none"
document.body.appendChild(consoleFrame)
const console = consoleFrame.contentWindow.console

/* == QoL Functions == */

/** Scrolls to the first uncompleted skill */
const scrollLearn = async () => {
  await delay(100) // Give the page some time to load

  while (true) {
    const allSkills = Array.from($("[data-test='skill']"))

    if (allSkills.length > 0) { // Don't run before the page finished loading
      const loadedSkills = Array.from($("[data-test='skill-icon']"))
      const uncompletedSkills = loadedSkills.filter(el => !Array.from(el.children[0].classList).includes("_3dqWQ"))

      // Scroll until we get to the first uncompleted skill
      if (uncompletedSkills.length === 0 && loadedSkills.length < allSkills.length) {
        loadedSkills.at(-1).scrollIntoView() // Scroll to the last loaded skill
        await delay() // Wait for more skills to load
      } else {
        const targetSkill = uncompletedSkills[0] // Find the first uncompleted skill

        // Scroll to skill:
	      targetSkill.scrollIntoView()
        scrollBy(0, -450)
        break
      }
    } else { // Give the page some time to load
      await delay(50)
    }
	}
}

// Cleans Duolingo Stories from stupid stories:
const cleanStories = async () => {
	// Get all stories:
	let stories = []

	// If there are no stories at all, wait for the page to load and try again:
	while (stories.length === 0) {
		await delay(100)
		stories = Array.from($("._1eZU8"))
	}

	// Remove stories:
	for (const story of stories) {
		if (storiesToHide.includes(story.textContent)) story.parentElement.parentElement.remove()
	}
}

// Scrolls to the first uncompleted story:
const scrollStories = async () => {
	// Find the first uncompleted story (based on background color):
	let story = null
	while (!story) {
		await delay(100)
		story = Array.from($("._2zY7s"))
			.filter(el => !["rgb(251, 177, 0)", "rgb(255, 177, 0)"].includes(el.style.backgroundColor))[0]
	}

	// Scroll to story:
	story.scrollIntoView()
	scrollBy(0, -450)
}

// Track page changes using MutationObserver:
const urlTracker = new MutationObserver(async () => {
	const url = document.URL

	// Run once per page change:
	if (url === urlTracker.cache.url) return

	urlTracker.cache.url = url

	if (/^.*duolingo\.com\/learn.*$/.test(url)) {
		await scrollLearn()
	} else if (/^.*duolingo\.com\/stories.*$/.test(url)) {
		await cleanStories()
		await scrollStories()
	}
})

/* == Custom CSS == */

const style = document.createElement('style')
style.innerHTML = 'img[src="' + imagesToHide.join('"], img[src="') + ' { width: 0px !important }'

/* == Initialization == */

document.body.append(style)
urlTracker.cache = {}
urlTracker.observe(document, { childList: true, subtree: true })
