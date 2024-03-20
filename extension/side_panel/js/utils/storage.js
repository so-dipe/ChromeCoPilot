function getUserId() {
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

function getUserData() {
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

function getChatId() {
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

function setChatId(chatId) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ chatId: chatId }, () => {
            resolve();
        });
    });
}

function getToken() {
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

//Database
var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
var db;

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("ConversationsDB", 1);

        request.onupgradeneeded = function(event) {
            db = event.target.result;
            var objectStore = db.createObjectStore("conversations", { keyPath: "id" });
            objectStore.createIndex("id", "id", { unique: true });
            objectStore.createIndex("title", "title", { unique: false });
            objectStore.createIndex("lastUpdated", "lastUpdated", { unique: false });
            objectStore.createIndex("messages", "messages", { unique: false });
        };

        request.onerror = function(event) {
            console.error("Database error: " + event.target.errorCode);
            reject(new Error("Database error: " + event.target.errorCode));
        };

        request.onsuccess = function(event) {
            db = event.target.result;
            console.log("Database opened successfully");
            resolve();
        };
    });
}

async function getConversationsList() {
    if (!db) {
        await openDatabase();
    }
    console.log("DB:", db);
    return new Promise((resolve, reject) => {
        var transaction = db.transaction(["conversations"]);
        var objectStore = transaction.objectStore("conversations");
        var results = [];

        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                var conversation = cursor.value;
                results.push({
                    id: conversation.id,
                    title: conversation.title,
                    lastUpdated: conversation.lastUpdated,
                })
                cursor.continue();
            } else {
                resolve(results);
            }
        };

        transaction.onerror = function(event) {
            console.error("Transaction error: " + event.target.errorCode);
        };
    });
}

async function getConversationById(id) {
    if (!db) {
        await openDatabase();
    }
    return new Promise((resolve, reject) => {
        var transaction = db.transaction(["conversations"]);
        var objectStore = transaction.objectStore("conversations");
        var request = objectStore.get(id);
        request.onsuccess = function(event) {
            console.log("conversation retrieved.")
            resolve(request.result);
        };
    });

}

async function appendMessageToConversation(id, messageContent, role, title=null) {
    if (!db) {
        await openDatabase();
    }
    return new Promise((resolve, reject) => {
        var transaction = db.transaction(["conversations"], "readwrite");
        var objectStore = transaction.objectStore("conversations");
        var request = objectStore.get(id);
        var message = {
            content: messageContent,
            role: role,
            // timestamp: new Date().getTime()
        }
        request.onsuccess = async function(event) {
            var conversation = request.result;
            if (conversation === undefined) {
                try {
                    conversation = await createConversation(id);
                } catch (error) {
                    console.error("Error creating conversation:", error);
                    return;
                }
            }
            console.log(conversation);
            conversation.messages.push(message);
            conversation.lastUpdated = new Date().getTime();
            if (title) {
                conversation.title = title;
            }
            var updateRequest = objectStore.put(conversation);
            updateRequest.onsuccess = function(event) {
                console.log("Message added to conversation");
                resolve();
            };
        };
        
    });
}

async function createConversation(chatId) {
    if (!db) {
        await openDatabase();
    }
    new Promise((resolve, reject) => {
        var transaction = db.transaction(["conversations"], "readwrite");
        var objectStore = transaction.objectStore("conversations");
        var request = objectStore.add({
            id: chatId,
            title: "Untitled Conversation",
            lastUpdated: new Date().getTime(),
            messages: []
        });
        request.onsuccess = function(event) {
            console.log("conversation created.")
            resolve(getConversationById(request.result));
        };
    });
}

async function deleteConversation(id) {
    if (!db) {
        await openDatabase();
    }
    new Promise((resolve, reject) => {
        var transaction = db.transaction(["conversations"], "readwrite");
        var objectStore = transaction.objectStore("conversations");
        var request = objectStore.delete(id);
        request.onsuccess = function(event) {
            resolve();
        };
    });
}
