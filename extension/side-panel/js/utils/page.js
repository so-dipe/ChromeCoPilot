function loadScriptsFromHTML(html) {
  const scripts = Array.from(
    new DOMParser()
      .parseFromString(html, "text/html")
      .querySelectorAll("script")
  );
  const existingScripts = document.querySelectorAll("script");

  // Remove existing scripts
  existingScripts.forEach((existingScript) => {
    existingScript.remove();
  });

  // Add new scripts
  scripts.forEach((script) => {
    const newScript = document.createElement("script");
    newScript.src = script.src;
    document.head.appendChild(newScript);
  });
}

async function openProfile() {
  fetch(chrome.runtime.getURL("/side-panel/profile.html"))
    .then((response) => response.text())
    .then(async (html) => {
      document.getElementById("content").innerHTML = html;
      loadScriptsFromHTML(html);
    })
    .catch((error) => {
      console.error("Error fetching Profile:", error);
    });
}

async function openIndex() {
  fetch(chrome.runtime.getURL("/side-panel/index.html"))
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("content").innerHTML = html;
      loadScriptsFromHTML(html);
    })
    .catch((error) => {
      console.error("Error fetching Index:", error);
    });
}

async function openChat(chatId = null) {
  try {
    const htmlResponse = await fetch(
      chrome.runtime.getURL("/side-panel/chat.html")
    );
    const html = await htmlResponse.text();

    document.getElementById("content").innerHTML = html;
    loadScriptsFromHTML(html);

    let idToFetch = chatId || (await getCurrentChatIdFromStorage());
    if (idToFetch) {
      const token = await getTokenFromStorage();
      fetchChatData(token, idToFetch);
      setCurrentChatIdInStorage(idToFetch);
    } else {
      chatId = await generateChatId();
      setCurrentChatIdInStorage(chatId);
    }
  } catch (error) {
    console.error("Error fetching Chat:", error);
  }
}

async function displayUserInfo(userData) {
  const profileUriElement = document.getElementById("profile-uri");
  const displayNameElement = document.getElementById("display-name");
  const chatsContainer = document.getElementById("chats-container");

  if (profileUriElement && displayNameElement && chatsContainer) {
    profileUriElement.src = userData.photoUrl;
    displayNameElement.textContent = `${userData.displayName}`;

    const chats = await retrieveChats(userData.localId);
    chatsContainer.innerHTML = "";
    console.log(chats);

    Object.keys(chats).forEach((chatId) => {
      const chatData = chats[chatId];
      const chatLink = document.createElement("a");
      chatLink.textContent = `${chatData.title} last updated at ${chatData.lastUpdated}`;
      console.log(chatId);
      chatLink.href = "#";
      chatLink.addEventListener("click", () => {
        openChat(chatId);
      });
      chatsContainer.appendChild(chatLink);
      chatsContainer.appendChild(document.createElement("br"));
    });
  }
}
