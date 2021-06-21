// ==UserScript==
// @name        Duolingo QoL
// @description Duolingo quality of life features
// @match       https://www.duolingo.com/*
// @grant       none
// @version     0.1
// @author      Michael T
// ==/UserScript==

"use strict"

storiesToHide = [
	"The Honeymoon",
	"A Very Big Family",
	"Where Is Your Girlfriend?",
]

// Helper functions:
const qs = selector => document.querySelector(selector)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
