function navigateToPage(url) {
    window.location.href = url;
}

async function logout() {
    chrome.storage.local.clear(() => {
        console.log('User logged out');
        navigateToPage('index.html');
    });
}

async function openChat(chatId = null) {
    try {
        let id = chatId || await getChatId() || await generateChatId();
        
        if (id) {
            await setChatId(id);
            navigateToPage('chat.html');
        } else {
            console.error("Failed to get or generate chat ID.");
        }
    } catch (error) {
        console.error("Error opening chat:", error);
    }
}

async function generateChatId() {
    var userId = await getUserId();
    var timestamp = new Date().getTime();
    var uniqueId = userId + '-' + timestamp;
    setChatId(uniqueId);
    return uniqueId;
}

async function refreshIdToken() {
    chrome.storage.local.get(['user'], async (result) => {
        if (result && result.user && result.user.refreshToken) {
            const url = `${SERVER_URL}/refresh_token`;
            const formData = new URLSearchParams();
            formData.append('refresh_token', result.user.refreshToken);
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData
            });
            if (response.ok) {
                const data = await response.json();
                result.user.idToken = data.id_token;
                result.user.refreshToken = data.refresh_token;
                chrome.storage.local.set({ user: result.user }, () => {
                    console.log('idToken refreshed');
                });
                return true
            } else {
                console.error(`Request failed with status ${response.status}`);
            }
        }
    });
}