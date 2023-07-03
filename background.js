"use strict";

const uaStrings = {
    "Default": "",
    "Actual": "Mozilla/5.0 (PLATFORM) Gecko/20100101 Firefox/VERSION",
};

const greenIcons = {
    "16": "icons/icon-green-16.png",
    "32": "icons/icon-green-32.png"
};

const redIcons = {
    "16": "icons/icon-red-16.png",
    "32": "icons/icon-red-32.png"
};


let uaMapping =  {};

function getMappingForDomain(domain) {
    return uaMapping[domain] || "Default"
}

function getTemplateForDomain(domain) {
    return uaStrings[getMappingForDomain(domain)];
}

async function getUAforDomain(domain){
    let agentTemplate = getTemplateForDomain(domain);
    if (agentTemplate !== "") {
        // fill out the template.
        const platInfo = await browser.runtime.getPlatformInfo();
        const browserInfo = await browser.runtime.getBrowserInfo();
        let platform = "";
        switch (platInfo.os) {
        case "linux":
            platform = "X11; Linux x86_64; rv:109.0";
            break;
        case "mac":
            platform = "Macintosh; Intel Mac OS X 13.4; rv:109.0";
            break;
        default:
            platform = "Windows NT 10.0; Win64; x64; rv:109.0";
        }

        agentTemplate = agentTemplate.replace("VERSION", browserInfo.version);
        agentTemplate = agentTemplate.replace("PLATFORM", platform);
        return agentTemplate;
    }
    return null;
}

async function deleteMapping(domain){
	  delete(uaMapping[domain]);
	  saveMappings();
}

async function addMapping(domain, m){
	  uaMapping[domain] = m;
	  saveMappings();
}

async function saveMappings() {
    try {
	      browser.storage.local.set({"mapping": JSON.stringify(uaMapping)});
    } catch (err) {}
}

async function loadMappings() {
    try {
	      let storageItem = await browser.storage.local.get("mapping");
		} catch (err) {}
}

async function rewriteUserAgentHeader(e) {
	  const override = await getUAforDomain(new URL(e.url).host)
	  if (override !== null) {
		    for (var header of e.requestHeaders) {
			      if (header.name.toLowerCase() === "user-agent") {
				        header.value = override;
			      }
		    }
	  }
	  return {requestHeaders: e.requestHeaders};
}

async function updateIcons(_) {
    const tabs = await browser.tabs.query({active: true, currentWindow: true});
    if (!tabs[0]) { return; }
    const overridden = await getUAforDomain(new URL(tabs[0].url).host);
    if (overridden !== null) {
        await browser.browserAction.setIcon({
            path: greenIcons,
            tabId: tabs[0].id
        });
        await browser.browserAction.setTitle({
            title: "Well, Ackshully we're using the actual User-Agent"
        });
    } else {
        await browser.browserAction.setIcon({
            path: redIcons,
            tabId: tabs[0].id
        });
        await browser.browserAction.setTitle({
            title: "We're NOT Ackshully using the real User-Agent. This may help preserve your privacy."
        });
    }
}

browser.tabs.onUpdated.addListener(updateIcons);
browser.tabs.onActivated.addListener(updateIcons);
browser.webRequest.onBeforeSendHeaders.addListener(rewriteUserAgentHeader,
                                                   {urls: ["<all_urls>"]},
                                                   ["blocking", "requestHeaders"]);

loadMappings();
