BUNDLE_NAME = ackshully-user-agent.zip
BACKGROUND_SRC = background.js
POPUP_SRC = popup.js popup.html popup.css
ICONS = $(wildcard icons/*.png)

bundle:
	zip $(BUNDLE_NAME) manifest.json $(BACKGROUND_SRC) $(POPUP_SRC) $(ICONS)
