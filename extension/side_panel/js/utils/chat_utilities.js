async function renderChat(chat) {
    if (!chat) {
      return;
    }
    const messages = chat.messages || [];
    messages.forEach(message => {
        appendMessage(message.content, message.role);
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function fetchAndRenderConversation(chatId) {
    try {
        conversation = await getConversationById(chatId);
        renderChat(conversation);
    } catch (error) {
        throw new Error("Error fetching conversation:", error);
    }
}

async function sendMessage(message, stream = true) {
    try {
        chatId = await getChatId()
        idToken = await getToken();
        URL = stream ? `${SERVER_URL}/api/v1/messaging/stream_response` : `${SERVER_URL}/api/v1/messaging/generate_response`;
        let conversation = await getConversationById(chatId);
        if (!conversation) {
            conversation = createConversation(chatId);
        }
        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ prompt: message, chat_id: chatId, history: conversation.messages })
        });
        if (!response.ok) {
          if (response.status === 401) {
              throw new Error('Unauthorized');
          } else if (response.status === 419) {
              refreshed = await refreshIdToken();
              console.log('refreshed', refreshed);
              if (refreshed) {
                sendMessage(message, stream);
                return;
              }            
          }
        }
    
        if (stream) {
            getStreamingResponse(response, message, chatId)
        } else {
            getResponse(response);
        }
    } catch (error) {
        throw new Error(error)
    }
}

async function getStreamingResponse(response, message, chatId) {
    reader = response.body.getReader();
    decoder = new TextDecoder();
    messageContainer = createMessageContainer();
    tempElement = createTempElement(messageContainer);
    cursor = createCursor(tempElement);
    temporary = document.createElement('div');

    let autoScroll = true;
    let concatenatedText = '';
  
    function processText ({ value, done }) {
      if (done) {
        cursor.classList.remove('cursor');
        tempElement.innerHTML = marked(temporary.innerHTML)
        if (autoScroll) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        appendMessageToConversation(chatId, message, 'user');
        appendMessageToConversation(chatId, concatenatedText, 'model');
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
  
    const { value, done } = await reader.read();
    const result = processText({ value, done });
    return result;
}

function createMessageContainer() {
    const messageContainer = document.createElement('div');
    const authorInfo = document.createElement('div');
    authorInfo.textContent = 'Chrome Co-Pilot';
    authorInfo.classList.add('author-info');
    messageContainer.appendChild(authorInfo);
    messageContainer.classList.add('message', 'copilot-message');
    messagesContainer.appendChild(messageContainer);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return messageContainer;
}

function createTempElement(messageContainer) {
    const tempElement = document.createElement('div');
    tempElement.classList.add('marked-content');
    messageContainer.appendChild(tempElement);
    return tempElement;
}

function createCursor(tempElement) {
    const cursor = document.createElement('span');
    cursor.classList.add('cursor');
    tempElement.appendChild(cursor);
    return cursor;
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
    userData = await getUserData();
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
      sendMessage(message);
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
