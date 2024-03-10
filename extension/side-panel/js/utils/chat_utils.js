async function renderChat(chat) {
    const messages = chat.messages || [];
    messages.forEach(message => {
        appendMessage(message.content, message.role);
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function fetchChatData(token, chatId) {
    try {
        const url = `${SERVER_URL}/api/v1/chat/c/${chatId}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const chat = await response.json();
            renderChat(chat);
        } else if (response.status === 419) {
            refreshIdToken();
            return await fetchChatData(token, chatId);
        } else {
            throw new Error(`Request failed with status ${response.status}`);
        }

    } catch (error) {
        console.error("Error fetching chat:", error);
    }
}

async function retrieveChats(userId) {
    const token = await getTokenFromStorage();
    try {
        url = `${SERVER_URL}/api/v1/chat/${userId}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                contentType: "application/json",
                authorization: `Bearer ${token}`
            }
        })
        if (response.ok) {
            return await response.json();
        } else if (response.status === 419) {
            await refreshIdToken();
            return await retrieveChats(userId, token);
        } else {
            throw new Error(`Request failed with status ${response.status}`);
        }
    } catch (error) {
        console.error("Error retrieving chats:", error);
        return [];
    }
}

async function generateChatId() {
    var userId = await getUserIdFromStorage();
    var timestamp = new Date().getTime();
    var uniqueId = userId + '-' + timestamp;
    await setCurrentChatIdInStorage(uniqueId);
    return uniqueId;
}
