function getUserIdFromStorage() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['user'], (result) => {
            if (result && result.user && result.user.localId) {
                resolve(result.user.localId);
            } else {
                resolve(null);
            }
        })
    });
}

function getUserDataFromStorage() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['user'], (result) => {
            if (result && result.user) {
                resolve(result.user);
            } else {
                resolve(null);
            }
        })
    });
}

function getCurrentChatIdFromStorage() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['chatId'], (result) => {
            if (result && result.chatId) {
                resolve(result.chatId);
            } else {
                resolve(null);
            }
        })
    });
}

function getTokenFromStorage() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['user'], (result) => {
            if (result && result.user && result.user.idToken) {
                resolve(result.user.idToken);
            } else {
                resolve(null);
            }
        })
    });
}

function getLoggedInStatus() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['loggedIn'], (result) => {
            if (result && result.loggedIn) {
                resolve(true);
            } else {
                resolve(false);
            }
        })
    });
}

function setCurrentChatIdInStorage(chatId) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ chatId: chatId }, () => {
            resolve();
        });
    });
}
