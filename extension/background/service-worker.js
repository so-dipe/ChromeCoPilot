chrome.sidePanel
    .setPanelBehavior({openPanelOnActionClick : true})
    .catch((error) => console.error(error));

chrome.contextMenus.create({
    contexts: ['selection'],
    title: 'Explain with CoPilot',
    id: 'explain-with-copilot',
    visible: true,
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    chrome.sidePanel.open({windowId: tab.windowId})
    if (info.menuItemId === 'explain-with-copilot') {
        setTimeout(() => {
            chrome.runtime.sendMessage({type: 'explain', text: info.selectionText});
        }, 250);
    }
});