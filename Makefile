BUNDLE_NAME = build/ackshully-user-agent.zip
BACKGROUND_SRC = background.js
POPUP_SRC = popup.js popup.html popup.css
ICONS = $(wildcard icons/*.png)

bundle:
	@mkdir -p build/
	zip $(BUNDLE_NAME) manifest.json $(BACKGROUND_SRC) $(POPUP_SRC) $(ICONS)
