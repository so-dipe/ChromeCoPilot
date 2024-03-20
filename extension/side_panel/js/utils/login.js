function fetchUserDataFromFirebase(token) {
    fetch(`${SERVER_URL}/auth/oauth/google/get_user`, {
        method: "GET",
        headers: {
            contentType: "application/json",
            authorization: `Bearer ${token}`
        }
    }).then(async (response) => {
        if (response.ok) {
            const userData = await response.json();
            console.log(userData);
            chrome.storage.local.set({ user: userData }, () => {
                console.log('User data saved');
            });
            chrome.storage.local.set({ loggedIn: true }, () => {
                console.log('User logged in');
                navigateToPage('profile.html');
            });
        } else {
            throw new Error(`Request failed with status ${response.status}`);
        }
    }).catch(error => {
        console.error("Error fetching user data:", error);
    });
}

function handleGoogleLogin() {
    const width = 500;
    const height = 600;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;

    chrome.windows.create({
        url: `${SERVER_URL}/auth/oauth/google/signin`,
        type: "popup",
        width: width,
        height: height,
        left: left,
        top: top
    }, (window) => {
        const updateListener = async (tabId, changeInfo, tab) => {
            if (tab.windowId === window.id && tab.url && tab.url.startsWith(SERVER_URL)) {
                chrome.cookies.get({ name: "token", url: tab.url }, async (cookie) => {
                    if (cookie) {
                        chrome.tabs.onUpdated.removeListener(updateListener);

                        await chrome.tabs.remove(tabId);

                        const token = cookie.value;
                        fetchUserDataFromFirebase(token);
                    }
                });
            }
        };
        chrome.tabs.onUpdated.addListener(updateListener);
    });
}