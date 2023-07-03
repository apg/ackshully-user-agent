async function handleClick(e) {
	  if (!e.target.classList.contains("save")) {
		    return;
	  }

    const backgroundPage = await browser.extension.getBackgroundPage();

	  const fd = new FormData(document.querySelector("form"));
	  let domain = "all";
	  if (["btnResetThisDomain","btnOverrideThisDomain"].includes(e.target.id)){
		    domain = fd.get("current_domain")
	  }
	  if (["btnOverrideThisDomain"].includes(e.target.id)) {
		    backgroundPage.addMapping(domain, "Actual");
	  }
	  else if (["btnResetThisDomain"].includes(e.target.id)) {
		    backgroundPage.deleteMapping(domain, "Default");
	  }
	  displayUIDetails();
}

function getCurrentPage(callback) {
	browser.tabs.query({active: true, currentWindow: true}).then(function(tabInfo){
		callback(tabInfo[0].url,tabInfo[0]);
	});
}

async function displayUIDetails() {
    const backgroundPage = await browser.extension.getBackgroundPage();
	  getCurrentPage(function(url, tabInfo){
		    const domain = new URL(url).host;
        const setting = backgroundPage.getMappingForDomain(domain);
        if (setting == "Actual") {
            document.querySelector(".using_actual").classList.remove("hide");
        } else {
            document.querySelector(".using_default").classList.remove("hide");
        }

		    document.querySelector("input.current_domain").value = domain;
	  });
}

document.addEventListener("click", handleClick);
displayUIDetails();
