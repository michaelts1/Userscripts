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
]

/* == Helper functions == */

const qs = selector => document.querySelector(selector)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

// `console` is overwritten by Duolingo.com. So we need to steal the original `console` from an iframe.
// Credit: https://stackoverflow.com/a/7081490
const consoleFrame = document.createElement('iframe')
consoleFrame.style.display = "none"
document.body.appendChild(consoleFrame)
const log = consoleFrame.contentWindow.console.log

/* == QoL Functions == */

// Scrolls to the first uncompleted skill:
const scrollLearn = async () => {
	// Find the first uncompleted skill (based on class):
	let skill = null
	while (!skill) {
		await delay(100)
		skill = Array.from(document.querySelectorAll("[data-test='skill-icon']"))
			.filter(el => !Array.from(el.children[0].classList).includes("_3dqWQ"))[0]
	}

	// Scroll to skill:
	skill.scrollIntoView()
	scrollBy(0, -450)
}

// Cleans Duolingo Stories from stupid stories:
const cleanStories = async () => {
	// Get all stories:
	let stories = []

	// If there are no stories at all, wait for the page to load and try again:
	while (stories.length === 0) {
		await delay(100)
		stories = Array.from(document.querySelectorAll("._1eZU8"))
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
		story = Array.from(document.querySelectorAll("._2zY7s"))
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

/* == Initialization == */

urlTracker.cache = {}
urlTracker.observe(document, {attributes: true, subtree: true})
