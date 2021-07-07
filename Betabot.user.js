// ==UserScript==
// @name         Betabot
// @namespace    http://tampermonkey.net
// @version      0.9.9
// @description  never run in main!
// @run-at       document-idle
// @author       Batosi & Michael T
// @match        https://beta.avabur.com/game
// @grant        GM_addStyle
// ==/UserScript==
(function($) {
    'use strict';
    //Betabot:
    let vars = {
        doQuests          : localStorage.getItem('betabot_quests') == "true",
        doBuildingAndHarvy: localStorage.getItem('betabot_construction') == "true",
        doCraftQueue      : localStorage.getItem('betabot_crafting') == "true",
        queued            : false,
        actionsPending    : false,
        questCompleting   : null,
        buttonDelay       : 500,
        startActionsDelay : 1000,
        minCraftingQueue  : 2,
        username          : $("#username").text(),
        minimumSend: {
            crystals: 0,
            platinum: 100,
            //gold : 10000,
            crafting_materials: 100,
            gem_fragments: 100
        },
    }

    let finishQuest = (event, data) => {
        setTimeout(() => {
            $(`input.completeQuest[data-questtype=${vars.questCompleting}]`).click() //complete the quest
            $(document).one('roa-ws:page:quests', () => {
                setTimeout(() => {
                    $(`input.questRequest[data-questtype=${vars.questCompleting}]`).click() //start new quest
                    $(document).one('roa-ws:page:quests', () => { //close the quest window
                        setTimeout(() => {
                            vars.actionsPending = false
                            vars.questCompleting = null
                            $(".closeModal").click()
                        }, vars.buttonDelay)
                    })
                }, vars.buttonDelay)
            })
        }, vars.startActionsDelay)
    }

    let selectBuild = (event, data) => {
        setTimeout(() => {
            if ($("#houseRoomCanBuild").is(":visible")) { //if new room is available, build it
                $(document).one('roa-ws:page:house_build_room', itemBuilding)
                setTimeout(() => { $("#houseBuildRoom")[0].click() }, vars.buttonDelay)
            } else if ($("#houseQuickBuildList li:first .houseViewRoom").length === 1) { //if new item is available, build it
                $(document).one('roa-ws:page:house_room', buildItem)
                setTimeout(() => { $("#houseQuickBuildList li:first .houseViewRoom").click() }, vars.buttonDelay)
            } else { //else, upgrade existing item
                $(document).one('roa-ws:page:house_room_item', upgradeItem)
                setTimeout(() => { $("#houseQuickBuildList li:first .houseViewRoomItem").click() }, vars.buttonDelay)
            }
        }, vars.startActionsDelay)
    }

    let buildItem = (event, data) => {
        setTimeout(() => {
            $(document).one('roa-ws:page:house_build_room_item', itemBuilding)
            setTimeout(() => { $("#houseBuildRoomItem").click() }, vars.buttonDelay)
        }, vars.startActionsDelay)
    }

    let upgradeItem = (event, data) => {
        setTimeout(() => {
            if ($("#houseRoomItemUpgradeTier").is(":visible")) { //if tier upgrade is available, upgrade it
                $(document).one('roa-ws:page:house_room_item_upgrade_tier', itemBuilding)
                setTimeout(() => { $("#houseRoomItemUpgradeTier").click() }, vars.buttonDelay)
            } else { //else do a regular upgrade
                $(document).one('roa-ws:page:house_room_item_upgrade_level', itemBuilding)
                setTimeout(() => { $("#houseRoomItemUpgradeLevel").click() }, vars.buttonDelay)
            }
        }, vars.startActionsDelay)
    }

    let itemBuilding = (event, data) => {
        $("#confirmOverlay > a.red").click() //if there is confirmation layer, close it.
        setTimeout(() => {
            vars.actionsPending = false
            $(".closeModal").click()
        }, vars.startActionsDelay)
    }

    let checkCraftingQueue = (event, data) => {
        if (vars.actionsPending || !vars.doCraftQueue) {
            return
        }
        if (data.results.a.cq < vars.minCraftingQueue) {
            vars.actionsPending = true
            setTimeout(() => { $(".craftingTableLink").click() }, vars.buttonDelay)
            $(document).one('roa-ws:page:house_room_item', () => {
                setTimeout(() => {
                    $("#craftingItemLevelMax").click()
                    setTimeout(() => {
                        $("#craftingQuality").val(0) //set to poor quality
                        $("#craftingJobFillQueue").attr("checked", "true")
                        $("#craftingJobStart").click()
                    }, vars.buttonDelay)
                }, vars.startActionsDelay)
                $(document).one('roa-ws:page:craft_item', itemBuilding)
            })
        }
    }

    let startHarvestron = (event, data) => {
        $("#houseHarvestingJobStart").click()
        setTimeout(itemBuilding, vars.buttonDelay)
    }

    let checkResults = (event, data) => {
        data = data.results.p
        if (data.autos_remaining < 5){ //Stamina
            $("#replenishStamina").click();
        }
        if (vars.actionsPending) { //make sure there are no actions pending
            return
        }
        if (vars.doQuests) { //Quests
            if (data.bq_info2 !== undefined) {
                if (data.bq_info2.c >= data.bq_info2.r) {
                    vars.questCompleting = 'kill'
                }
            }
            if (data.tq_info2 !== undefined) {
                if (data.tq_info2.c >= data.tq_info2.r) {
                    vars.questCompleting = 'tradeskill'
                }
            }
            if (data.pq_info2 !== undefined) {
                if (data.pq_info2.c >= data.pq_info2.r) {
                    vars.questCompleting = 'profession'
                }
            }
            if (vars.questCompleting != null) {
                vars.actionsPending = true
                $(document).one('roa-ws:page:quests', finishQuest)
                setTimeout(() => { $("a.questCenter").click() }, vars.buttonDelay)
                return
            }
        }
        if (vars.doBuildingAndHarvy && data.can_build_house) { //Construction
            vars.actionsPending = true
            $(document).one('roa-ws:page:house', selectBuild)
            $("li#housing").click()
            return
        }
        if (vars.doBuildingAndHarvy && data.can_house_harvest) { //Harvestron
            vars.actionsPending = true
            $(document).one('roa-ws:page:house_room_item', startHarvestron)
            $("#harvestronNotifier").click()
            return
        }
    }
    $(document).on('roa-ws:battle roa-ws:harvest roa-ws:carve roa-ws:craft roa-ws:event_action', checkResults)
    $(document).on('roa-ws:craft', checkCraftingQueue)

    $("#helpSection").append(`
    <li id="toggleAutoQuests">Auto Quests ${vars.doQuests ? 'On' : 'Off'}</li>
    <li id="toggleAutoConstruction">Auto Construction & Harvestron ${vars.doBuildingAndHarvy ? 'On' : 'Off'}</li>
    <li id="toggleAutoCraftingQueue">Auto Crafting Queue ${vars.doCraftQueue ? 'On' : 'Off'}</li>
    `)

    $("#toggleAutoQuests").click( () => {
        if (vars.doQuests) {
            localStorage.setItem('betabot_quests', "false")
            vars.doQuests = false
            $("#toggleAutoQuests").text("Auto Quests Off")
        } else {
            vars.doQuests = true
            localStorage.setItem('betabot_quests', "true")
            $("#toggleAutoQuests").text("Auto Quests On")
        }
    })

    $("#toggleAutoConstruction").click( () => {
        if (vars.doBuildingAndHarvy) {
            vars.doBuildingAndHarvy = false
            localStorage.setItem('betabot_construction', "false")
            $("#toggleAutoConstruction").text("Auto Construction & Harvestron Off")
        } else {
            vars.doBuildingAndHarvy = true
            localStorage.setItem('betabot_construction', "true")
            $("#toggleAutoConstruction").text("Auto Construction & Harvestron On")
        }
    })

    $("#toggleAutoCraftingQueue").click( () => {
        if (vars.doCraftQueue) {
            vars.doCraftQueue = false
            localStorage.setItem('betabot_crafting', "false")
            $("#toggleAutoCraftingQueue").text("Auto Crafting Queue Off")
        } else {
            vars.doCraftQueue = true
            localStorage.setItem('betabot_crafting', "true")
            $("#toggleAutoCraftingQueue").text("Auto Crafting Queue On")
        }
    })

    //auto event:
    //downloadURL: https://github.com/dragonminja24/betaburCheats/raw/master/betaburCheatsHeavyWeight.js
    let eventCommandChannel = 3098
    let primaryCarve =["michaelts", "michaeltsi", "michaeltsii", "michaeltsiii", "michaeltsiv", "michaeltsv", "michaeltsvi"]
    let msgID
    const fish  = document.getElementsByClassName('bossHarvest btn btn-primary')[4]
    const wood  = document.getElementsByClassName('bossHarvest btn btn-primary')[5]
    const iron  = document.getElementsByClassName('bossHarvest btn btn-primary')[6]
    const stone = document.getElementsByClassName('bossHarvest btn btn-primary')[7]
    const craft = document.getElementsByClassName('bossCraft btn btn-primary')[0]
    const carve = document.getElementsByClassName('bossCarve btn btn-primary')[0]
    let buttonList = [fish,wood,iron,stone,craft,carve]
    let isMain = true
    let mainTrade = 5 // 0 = food , 1 = wood , 2 = iron , 3 = stone , 4 = craft , 5 = carve
    let secondaryTrade = 0
    let eventId = null
    let eventLimiter = 0
    let carvingChanger = 0
    let mainChanger = 0
    let altChanger = 0
    let bossChanger = 0
    let mainEvent = false

    let username = $("#username").text()
    if(username == "michaelts"){
        isMain = true
    }

    function changeTrade(event, data){
        let time = data.results.p.event_end
        if($('#currentBossCarvingTier')[0].innerHTML > 2500 && carvingChanger == 0 && !mainEvent){
            ++carvingChanger
            if(secondaryTrade != 5){
                buttonList[secondaryTrade].click()
            }else{
                document.getElementsByClassName('bossFight btn btn-primary')[0].click()
            }
        }
        if(isMain){
            if(time <= 180 && mainChanger == 0){
                ++mainChanger
                buttonList[secondaryTrade].click()
            }
            if(time <= 120 && bossChanger == 0){
                ++bossChanger
                document.getElementsByClassName('bossFight btn btn-primary')[0].click()
            }
        }else{
            if(time <= 120 && altChanger == 0){
                ++altChanger
                buttonList[secondaryTrade].click()
            }
        }

        if(time <= 60){
            if(!isMain){
                if(!mainEvent){
                    document.getElementsByClassName('bossFight btn btn-primary')[0].click()
                }
            }
            carvingChanger = 0
            mainChanger = 0
            bossChanger = 0
            altChanger = 0
            mainEvent = false
        }
    }

    async function joinEvent(){
        if(eventLimiter == 0){
            ++eventLimiter
            let msg
            let msgsub
            if($('li[data-channel='+eventCommandChannel+']').length > 0){
                msg = $('li[data-channel='+eventCommandChannel+']')[0].innerHTML
                msgID = $('li[data-channel='+eventCommandChannel+']')[0].id
                msgsub = null
            }

            if(msg != null){
                msgsub = msg.substring(msg.length-16 , msg.length-7)
            }

            if(msgsub != null){
                if(msgID != eventId){
                    if(msgsub == 'InitEvent' || msgsub =='MainEvent'){
                        if(msgsub == 'MainEvent'){
                            mainEvent = true
                        }else{
                            mainEvent = false
                        }
                        eventId = msgID
                        buttonList[mainTrade].click()
                        setTimeout( () => {
                            $(document).on("roa-ws:event_action", changeTrade)
                        }, 70000)
                    }
                }
            }
            setTimeout( () => {eventLimiter = 0}, 5000)
        }
    }

    $("<style>").prop("type", "text/css").html(
		`#playerTutorial, #gameRules, #forumLink {
			display:none !important;
		}`
    ).appendTo("head")
    $("#effectInfo").remove()
})(jQuery);
