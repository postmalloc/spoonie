var enabled = false;
chrome.browserAction.onClicked.addListener(function (tab) {
    enabled = !enabled;
    chrome.browserAction.setIcon({ 
        path: enabled ? 'images/icon-on-38.png' : 'images/icon-off-38.png'
    });
    chrome.tabs.getSelected(null, function (tab) {
        chrome.tabs.sendMessage(tab.id, { message: enabled });
    });

    if (!enabled) {
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.reload(tab.id);
        });
    }
});

chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.msg == "enabled") {
            sendResponse(enabled);
        }
    }
);

