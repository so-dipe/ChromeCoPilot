document.getElementById('logout').addEventListener('click', () => {
    logout();
});

document.getElementById('profile').addEventListener('click', () => {
    openProfile();
});

document.getElementById('new-chat').addEventListener('click', () => {
    openChat();
});


inputForm = document.getElementById('input-form');
textInput = document.getElementById('input')
submit = document.getElementById('submit');
messagesContainer = document.getElementById('messages-container');


function appendMessage(message, sender) {
    const messageBox = document.createElement("div");
    messageBox.classList.add("message")
    if (sender === 'user') {
        messageBox.classList.add("user-message");
    } else {
        messageBox.classList.add("copilot-message");
    };
    messageBox.innerText = message
    messagesContainer.appendChild(messageBox);
}
inputForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = textInput.value;
    appendMessage(message, "user");
    textInput.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    sendText(message)
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message:', message);
    if (message.type === 'explain') {
        text.innerText = message.text;
    } else if (message.type === 'start-session') {
        text.innerText = message.text;
    }
});

async function sendText(message, stream=true) {
    chatId = await getCurrentChatIdFromStorage() || await generateChatId();
    idToken = await getTokenFromStorage();
    console.log(chatId, idToken, message, stream)
    const URL = stream ? `${SERVER_URL}/api/v1/messaging/stream_response` : `${SERVER_URL}/api/v1/messaging/generate_response`;
    fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({prompt: message, chat_id: chatId}),
    }).then(response => {
        if (stream) {
            getStreamingResponse(response);
        } else {
            getResponse(response);
        }
    }).catch(error => {
        console.error(error);
    });
};

function getStreamingResponse(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const messageBox = document.createElement("div");
    messageBox.classList.add("message")
    messageBox.classList.add("copilot-message")
    messagesContainer.appendChild(messageBox)

    const processText = async ({value, done}) => {
        if (done) {
            return;
        }
        const str = decoder.decode(value);
        let i = 0;
        function typeWriter() {
            if (i < str.length) {
                const char = str.charAt(i);
                if (char === ' ') {
                    messageBox.innerHTML += '&nbsp;';
                } else {
                    messageBox.innerText += char;
                }
                // messageBox.innerHTML = marked(messageBox.innerText)
                i++;
                setTimeout(typeWriter, 5);
            } else {
                reader.read().then(processText);
            }
        }
        typeWriter();
    };
    reader.read().then(processText);
}

function getResponse(response) {
    console.log(response.json);
    response.json().then(data => {
        appendMessage(data.text, "copilot")
        // text.innerText += "CoPilot: " + data.text + "\n";
    });
}
