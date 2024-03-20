async function renderChat(chat) {
    const messages = chat.messages || [];
    messages.forEach(message => {
        appendMessage(message.content, message.role);
    });
    // messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
            const refreshed = await refreshIdToken();
            if (refreshed) {
                token = await getTokenFromStorage()
                return await fetchChatData(token, userId);
            }
        } else {
            throw new Error(`Request failed with status ${response.status}`);
        }

    } catch (error) {
        console.error("Error fetching chat:", error);
    }
}

async function fetchAndRenderConversation(chatId) {
    try {
        conversation = await getConversationById(chatId);
        renderChat(conversation);
    } catch (error) {
        throw new Error("Error fetching conversation:", error);
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
            const refreshed = await refreshIdToken();
            if (refreshed) {
                return await retrieveChats(userId);
            }
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
    console.log(userId)
    var timestamp = new Date().getTime();
    var uniqueId = userId + '-' + timestamp;
    console.log(uniqueId)
    await setCurrentChatIdInStorage(uniqueId);
    return uniqueId;
}

async function sendText(message, stream = true) {
  chatId = await getCurrentChatIdFromStorage() || await generateChatId();
  idToken = await getTokenFromStorage();
  URL = stream ? `${SERVER_URL}/api/v1/messaging/stream_response` : `${SERVER_URL}/api/v1/messaging/generate_response`;

  fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({ prompt: message, chat_id: chatId })
  })
    .then(async (response) => {
      if (stream) {
        responseText = await getStreamingResponse(response);
        console.log(responseText)
        if (responseText) {
          appendMessageToConversation(chatId, message, 'user');
          appendMessageToConversation(chatId, responseText, 'model');
        } 
      } else {
        getResponse(response);
      }
    })
    .catch(error => {
      console.error(error);
    });

}

async function getStreamingResponse(response) {
    reader = response.body.getReader();
    decoder = new TextDecoder();
    messageContainer = document.createElement('div');
    authorInfo = document.createElement('div');
    authorInfo.textContent = 'Chrome Co-Pilot';
    authorInfo.classList.add('author-info');
    messageContainer.appendChild(authorInfo);
    messageContainer.classList.add('message', 'copilot-message');
    messagesContainer.appendChild(messageContainer);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
    tempElement = document.createElement('div');
    tempElement.classList.add('marked-content');
    messageContainer.appendChild(tempElement);
    temporary = document.createElement('div');
  
    // Create the cursor element
    cursor = document.createElement('span');
    cursor.classList.add('cursor');
    tempElement.appendChild(cursor);

    let autoScroll = true;
    let concatenatedText = '';
  
    processText = async ({ value, done }) => {
      if (done) {
        cursor.classList.remove('cursor');
        tempElement.innerHTML = marked(temporary.innerHTML)
        if (autoScroll) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        return concatenatedText;
      }
      str = decoder.decode(value);
      concatenatedText += str;
      i = 0;
  
      function typeWriter() {
        if (i < str.length) {
          char = str.charAt(i);
          if (char === '\n') {
            temporary.innerHTML += '<br>';
          } else {
            temporary.innerHTML += char;
          }
          tempElement.innerHTML = marked(temporary.innerHTML + cursor.outerHTML); 
          
          if (!isAtBottom(messagesContainer)) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }

          i++;
          setTimeout(typeWriter, 25);
        } else {
          reader.read().then(processText);
        }
      }
  
      typeWriter();
    };
  
    await reader.read().then(processText);
    console.log(concatenatedText)
    return concatenatedText;
  }

function isAtBottom(container) {
    return container.scrollHeight - container.scrollTop === container.clientHeight;
}

function getResponse(response) {
  response.json().then(data => {
    appendMessage(data.text, 'copilot');
  });
}

//UI FXNS
async function setProfileBackgroundImage() {
  userData = await getUserDataFromStorage();
  profileButton.style.backgroundImage = `url(${userData.photoUrl})`;
}

function toggleMenu() {
    menuIcon.classList.toggle('menu-open');
    navOverlay.classList.toggle('open');
  }

function handleSubmitButton(event) {
    if (input.textContent.trim().length > 0) {
        submitButton.style.display = 'block';
      } else {
        submitButton.style.display = 'none';
    }
}

function handleSubmitButtonClick(event) {
  event.preventDefault();
  message = input.textContent.trim();
  if (message) {
    appendMessage(message, 'user');
    input.textContent = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    sendText(message);
  }
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        handleSubmitButtonClick(event)
    }
}

function appendMessage(message, sender) {
    messageContainer = document.createElement('div');
    authorInfo = document.createElement('div');
    messageContainer.classList.add('message');

    if (sender === 'user') {
      messageContainer.classList.add('user-message');
      authorInfo.textContent = 'You';
    } else {
      authorInfo.textContent = 'Chrome Co-Pilot';
      messageContainer.classList.add('copilot-message');
    }

    authorInfo.classList.add('author-info');

    tempElement = document.createElement('div');
    tempElement.innerHTML = marked(message);
    tempElement.classList.add('marked-content');

    messageContainer.appendChild(authorInfo);
    messageContainer.appendChild(tempElement);
    messagesContainer.appendChild(messageContainer);
    hljs.highlightAll();
}
