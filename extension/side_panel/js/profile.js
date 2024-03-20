async function displayUserInfo(userData) {
    const profileUriElement = document.getElementById('profile-uri');
    const displayNameElement = document.getElementById('display-name');
    const chatsContainer = document.getElementById('chats-container');

    if (profileUriElement && displayNameElement && chatsContainer) {
        profileUriElement.src = userData.photoUrl;
        time = new Date().getHours();
        if (time < 12) {
            displayNameElement.textContent = `Good Morning, \n${userData.displayName}`;
        } else if (time < 18) {
            displayNameElement.textContent = `Good Afternoon, \n${userData.displayName}`;
        } else {
            displayNameElement.textContent = `Good Evening, \n${userData.displayName}`;
        }

        // const chats = await retrieveChats(userData.localId);
        const conversationList = await getConversationsList();
        chatsContainer.innerHTML = '';

        // Group conversations based on their last updated time
        const groupedConversations = groupConversationsByTime(conversationList);

        // Iterate over each group, sort them, and display in the UI
        const sortedTimeGroups = Object.keys(groupedConversations).sort((a, b) => {
            if (a === 'Today') return -1; // 'Today' comes first
            if (b === 'Today') return 1;
            if (a === 'Yesterday' && b !== 'Today') return -1; // 'Yesterday' comes after 'Today' and before 'This Week'
            if (b === 'Yesterday' && a !== 'Today') return 1;
            return 0; // 'This Week' and 'Older' maintain their relative order
        });
        
        // Iterate over the sorted time groups
        sortedTimeGroups.forEach(timeGroup => {
            const conversations = groupedConversations[timeGroup]; // Get conversations for the current time group
            conversations.reverse();
        
            const timeGroupHeader = document.createElement('h2');
            timeGroupHeader.textContent = timeGroup;
            timeGroupHeader.classList.add('time-group-header');
            chatsContainer.appendChild(timeGroupHeader);
        
            conversations.forEach(conversation => {
                const chatLink = document.createElement('div');
                const truncatedTimestamp = getTruncatedTimestamp(conversation.lastUpdated);
                const titleElement = document.createElement('span');
                titleElement.textContent = `${conversation.title}`;
                titleElement.classList.add('chat-title');
                const timestampElement = document.createElement('span');
                timestampElement.textContent = `${truncatedTimestamp}`;
                timestampElement.classList.add('chat-timestamp');
                const deleteButton = document.createElement('div');
                deleteButton.innerHTML = "&#xe872"
                deleteButton.classList.add('material-symbols-outlined');
                deleteButton.classList.add('delete-button');
                deleteButton.style.display = 'none';
                chatLink.appendChild(titleElement);
                chatLink.appendChild(timestampElement);
                chatLink.appendChild(deleteButton);
                chatLink.classList.add('chat-link');
                chatLink.addEventListener('click', () => {
                    openChat(conversation.id);
                });
                chatsContainer.appendChild(chatLink);
                chatLink.addEventListener('mouseover', () => {
                    timestampElement.textContent = getTruncatedTimestamp(conversation.lastUpdated, true);
                    deleteButton.style.display = 'block';
                });
                chatLink.addEventListener('mouseout', () => {
                    timestampElement.textContent = truncatedTimestamp;
                    deleteButton.style.display = 'none';
                });
                deleteButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    deleteConversation(conversation.id).then(() => {
                        chatLink.remove();
                    });
                });
            });
        });
    }
}

function groupConversationsByTime(conversationList) {
    const groupedConversations = {};
    conversationList.forEach(conversation => {
        const lastUpdatedDate = new Date(conversation.lastUpdated);
        const today = new Date().setHours(23, 59, 59, 999);
        const diffTime = Math.abs(today - lastUpdatedDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        let timeGroup;
        if (diffDays === 0) {
            timeGroup = 'Today';
        } else if (diffDays === 1) {
            timeGroup = 'Yesterday';
        } else if (diffDays <= 7) {
            timeGroup = 'Last 7 Days';
        } else {
            timeGroup = 'Older';
        }

        if (!groupedConversations[timeGroup]) {
            groupedConversations[timeGroup] = [];
        }
        groupedConversations[timeGroup].push(conversation);
    });
    return groupedConversations;
}

function getTruncatedTimestamp(timestamp, showDate = false) {
    const date = new Date(timestamp);
    let options;
    if (showDate) {
        options = { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    } else {
        options = { hour: 'numeric', minute: 'numeric' };
    }
    return date.toLocaleString(undefined, options);
}

window.addEventListener('load', () => {
    getUserData()
        .then(userData => {
            displayUserInfo(userData);
        })
        .catch(error => {
            console.error(error);
        });

    document.getElementById('logout').addEventListener('click', () => {
        logout();
    });

    document.getElementById('send-chat-button').addEventListener('click', () => {
        input = document.getElementById('chat-input').value

        setChatId(null).then(() =>
            openChat()
        );
    });
});